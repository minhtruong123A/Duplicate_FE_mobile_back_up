// src/services/auctionSocket.ts

// THÊM MỚI: Định nghĩa interface cho các tùy chọn của constructor
interface AuctionSocketOptions {
    urlBase: string; // Bắt buộc phải có
    token: string;
    auctionId: string;
    reconnect?: boolean;
    reconnectBase?: number;
    reconnectMax?: number;
    maxRetries?: number;
    heartbeatInterval?: number;
    heartbeatMsg?: string | object;
    debug?: boolean;
}

export default class AuctionSocket {
    // Khai báo kiểu dữ liệu cho các thuộc tính của class
    private ws: WebSocket | null;
    private urlBase: string;
    private token: string;
    private auctionId: string;
    private reconnect: boolean;
    private reconnectBase: number;
    private reconnectMax: number;
    private maxRetries: number;
    private heartbeatInterval: number;
    private heartbeatMsg: string | object;
    private debug: boolean;

    private forcedClose: boolean;
    private retryCount: number;
    private reconnectTimer: NodeJS.Timeout | null;
    private heartbeatTimer: NodeJS.Timeout | null;

    // Các hàm callback
    public onopen: (ev: Event) => void;
    public onmessage: (payload: any, ev: MessageEvent) => void;
    public onclose: (ev: CloseEvent) => void;
    public onerror: (ev: Event | Error) => void;
    public onauthfail: (code: number, reason: string) => void;

    constructor({
        urlBase,
        token,
        auctionId,
        reconnect = true,
        reconnectBase = 1000,
        reconnectMax = 30000,
        maxRetries = Infinity,
        heartbeatInterval = 0,
        heartbeatMsg = "ping",
        debug = false
    }: AuctionSocketOptions) {
        if (!auctionId) throw new Error("auctionId is required");
        if (!urlBase) throw new Error("urlBase is required for React Native environment");

        // SỬA LỖI: Gán giá trị cho TẤT CẢ các thuộc tính đã khai báo
        this.auctionId = auctionId;
        this.token = token || "";
        this.urlBase = urlBase;
        this.reconnect = reconnect;
        this.reconnectBase = reconnectBase;
        this.reconnectMax = reconnectMax;
        this.maxRetries = maxRetries;
        this.heartbeatInterval = heartbeatInterval;
        this.heartbeatMsg = heartbeatMsg;
        this.debug = debug;

        this.ws = null;
        this.forcedClose = false;
        this.retryCount = 0;
        this.reconnectTimer = null;
        this.heartbeatTimer = null;

        // Gán giá trị mặc định cho callbacks
        this.onopen = () => { };
        this.onmessage = () => { };
        this.onclose = () => { };
        this.onerror = () => { };
        this.onauthfail = () => { };

        this.connect();
    }

    // SỬA LỖI: Thêm kiểu 'any[]' cho args
    private _log(...args: any[]) {
        if (this.debug) console.log("[AuctionSocket]", ...args);
    }

    private _buildUrl(): string {
        let base = this.urlBase;
        base = base.replace(/^http:\/\//i, "ws://").replace(/^https:\/\//i, "wss://");
        const path = `/websocket/auction/${encodeURIComponent(this.auctionId)}`;
        const sep = base.endsWith("/") ? "" : "/";
        const tokenParam = `token=${encodeURIComponent(this.token || "")}`;
        return `${base}${sep}${path}?${tokenParam}`;
    }

    public connect(): void {
        if (!this.token) {
            this._log("No token set. Attempting connection without token.");
        }

        this.forcedClose = false;
        const url = this._buildUrl();
        this._log("Connecting to", url);

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = (ev) => {
                this._log("onopen", ev);
                this.retryCount = 0;
                this._clearReconnectTimer();
                if (this.heartbeatInterval > 0) {
                    this._startHeartbeat();
                }
                try { this.onopen(ev as Event); } catch (e) { console.error(e); }
            };

            this.ws.onmessage = (ev) => {
                let payload: any = ev.data;
                try {
                    payload = JSON.parse(ev.data);
                } catch (e) {
                    // keep raw text
                }
                try { this.onmessage(payload, ev as MessageEvent); } catch (e) { console.error(e); }
            };

            this.ws.onclose = (ev) => {
                this._log("onclose", ev);
                this._stopHeartbeat();
                if (ev.code === 4401 || ev.code === 1008) {
                    this._log("Auth failed (code)", ev.code, ev.reason);
                    try { this.onauthfail(ev.code, ev.reason); } catch (e) { console.error(e); }
                    return;
                }
                try { this.onclose(ev as CloseEvent); } catch (e) { console.error(e); }
                if (!this.forcedClose && this.reconnect && this.retryCount < this.maxRetries) {
                    this._scheduleReconnect();
                }
            };

            this.ws.onerror = (ev) => {
                this._log("onerror", ev);
                try { this.onerror(ev as Event); } catch (e) { console.error(e); }
            };
        } catch (err) {
            this._log("Connection attempt threw", err);
            try { this.onerror(err as Error); } catch (e) { console.error(e); }
            this._scheduleReconnect();
        }
    }

    private _startHeartbeat(): void {
        this._stopHeartbeat();
        if (this.heartbeatInterval > 0) {
            this.heartbeatTimer = setInterval(() => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    const msg = typeof this.heartbeatMsg === "string" ? this.heartbeatMsg : JSON.stringify(this.heartbeatMsg);
                    this._log("Sending heartbeat", msg);
                    this.ws.send(msg);
                }
            }, this.heartbeatInterval);
        }
    }

    private _stopHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    private _scheduleReconnect(): void {
        this.retryCount += 1;
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

    private _clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    public send(data: string | object): boolean {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this._log("Cannot send, socket not open");
            return false;
        }
        try {
            const payload = (typeof data === "object") ? JSON.stringify(data) : data;
            this.ws.send(payload);
            return true;
        } catch (err) {
            this._log("Send error", err);
            return false;
        }
    }

    public close(): void {
        this.forcedClose = true;
        this._clearReconnectTimer();
        this._stopHeartbeat();
        if (this.ws) {
            try { this.ws.close(); } catch (e) { /* ignore */ }
        }
    }

    public updateToken(newToken: string, { reconnectImmediate = true } = {}): void {
        this.token = newToken;
        this._log("Token updated");
        if (reconnectImmediate) {
            this._log("Reconnecting with new token...");
            this.forcedClose = false;
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                try { this.ws.close(); } catch (e) { /* ignore */ }
            } else {
                this._clearReconnectTimer();
                this.connect();
            }
        }
    }
}
