// src/services/ChatSocket.ts
export interface ChatSocketOptions {
    urlBase: string;
    token: string;
    conversationId: string;
    userId: string;
    reconnect?: boolean;
    reconnectBase?: number;
    reconnectMax?: number;
    maxRetries?: number;
    heartbeatInterval?: number;
    heartbeatMsg?: string | object;
    debug?: boolean;
}

export default class ChatSocket {
    private ws: WebSocket | null = null;
    private urlBase: string;
    private token: string;
    public conversationId: string;
    private userId: string;
    private reconnect: boolean;
    private reconnectBase: number;
    private reconnectMax: number;
    private maxRetries: number;
    private heartbeatInterval: number;
    private heartbeatMsg: string | object;
    private debug: boolean;

    private retryCount = 0;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private heartbeatTimer: NodeJS.Timeout | null = null;
    private forcedClose = false;

    public onopen: (ev: Event) => void = () => { };
    public onmessage: (msg: any, ev?: MessageEvent) => void = () => { };
    public onclose: (ev: CloseEvent) => void = () => { };
    public onerror: (ev: Event | Error) => void = () => { };
    public onauthfail: (code: number, reason: string) => void = () => { };

    constructor({
        urlBase,
        token,
        conversationId,
        userId,
        reconnect = true,
        reconnectBase = 1000,
        reconnectMax = 30000,
        maxRetries = Infinity,
        heartbeatInterval = 0,
        heartbeatMsg = "ping",
        debug = false
    }: ChatSocketOptions) {
        if (!urlBase || !conversationId || !userId) throw new Error("Missing required params");
        this.urlBase = urlBase.replace(/^http/i, "ws");
        this.token = token;
        this.conversationId = conversationId;
        this.userId = userId;
        this.reconnect = reconnect;
        this.reconnectBase = reconnectBase;
        this.reconnectMax = reconnectMax;
        this.maxRetries = maxRetries;
        this.heartbeatInterval = heartbeatInterval;
        this.heartbeatMsg = heartbeatMsg;
        this.debug = debug;

        this.connect();
    }

    private _log(...args: any[]) {
        if (this.debug) console.log("[ChatSocket]", ...args);
    }

    private _buildUrl(): string {
        const sep = this.urlBase.endsWith("/") ? "" : "/";
        const path = `websocket/chatbox/${this.conversationId}/${this.userId}`;
        const tokenParam = `token=${encodeURIComponent(this.token)}`;
        return `${this.urlBase}${sep}${path}?${tokenParam}`;
    }

    public connect(): void {
        if (!this.token) this._log("No token set. Connecting without token?");

        this.forcedClose = false;
        const url = this._buildUrl();
        this._log("Connecting to", url);

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = (ev) => {
                this._log("Connected, readyState =", this.ws?.readyState); // should be 1 (OPEN)
                this.retryCount = 0;
                this._clearReconnectTimer();
                if (this.heartbeatInterval > 0) this._startHeartbeat();
                try { this.onopen(ev); } catch (e) { console.error(e); }
            };

            this.ws.onmessage = (ev) => {
                let data: any = ev.data;
                try { data = JSON.parse(ev.data); } catch (e) { /* raw text */ }
                try { this.onmessage(data, ev); } catch (e) { console.error(e); }
            };

            this.ws.onclose = (ev) => {
                this._log("Connection closed", ev.code, ev.reason);
                this._stopHeartbeat();
                if (ev.code === 4401 || ev.code === 1008) {
                    this._log("Auth failed", ev.code, ev.reason);
                    try { this.onauthfail(ev.code, ev.reason); } catch (e) { }
                    return;
                }
                try { this.onclose(ev); } catch (e) { }
                if (!this.forcedClose && this.reconnect && this.retryCount < this.maxRetries) {
                    this._scheduleReconnect();
                }
            };

            this.ws.onerror = (ev) => {
                this._log("WebSocket error", ev);
                try { this.onerror(ev); } catch (e) { }
            };
        } catch (err) {
            this._log("Connect threw", err);
            try { this.onerror(err as Error); } catch (e) { }
            this._scheduleReconnect();
        }
    }

    private _startHeartbeat() {
        this._stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                const msg = typeof this.heartbeatMsg === "string" ? this.heartbeatMsg : JSON.stringify(this.heartbeatMsg);
                this._log("Sending heartbeat", msg);
                this.ws.send(msg);
            }
        }, this.heartbeatInterval);
    }

    private _stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    private _scheduleReconnect() {
        this.retryCount++;
        const backoff = Math.min(this.reconnectBase * Math.pow(1.5, this.retryCount - 1), this.reconnectMax);
        const jitter = backoff * 0.2 * (Math.random() - 0.5);
        const delay = Math.max(200, Math.floor(backoff + jitter));
        this._log(`Reconnect scheduled (#${this.retryCount}) in ${delay}ms`);
        this._clearReconnectTimer();
        this.reconnectTimer = setTimeout(() => {
            this._log("Reconnecting now...");
            this.connect();
        }, delay);
    }

    private _clearReconnectTimer() {
        if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    }

    public send(data: string | object) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this._log("Cannot send, socket not open");
            return false;
        }
        try {
            const payload = typeof data === "object" ? JSON.stringify(data) : data;
            this.ws.send(payload);
            return true;
        } catch (err) {
            this._log("Send error", err);
            return false;
        }
    }

    public close() {
        this.forcedClose = true;
        this._stopHeartbeat();
        this._clearReconnectTimer();
        this.ws?.close();
    }

    public updateToken(newToken: string, { reconnectImmediate = true } = {}) {
        this.token = newToken;
        this._log("Token updated");
        if (reconnectImmediate) {
            this._log("Reconnecting with new token...");
            this.forcedClose = false;
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.close();
            } else {
                this._clearReconnectTimer();
                this.connect();
            }
        }
    }
}
