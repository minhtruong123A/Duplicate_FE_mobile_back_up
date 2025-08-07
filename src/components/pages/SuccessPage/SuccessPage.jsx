import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateWallet } from "../../../redux/features/authSlice";

export default function SuccessPayment() {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentWalletAmount = useSelector(
        (state) => state.auth.user?.wallet_amount || 0
    );

    // Dùng ref để tránh gọi nhiều lần
    const hasUpdated = useRef(false);

    useEffect(() => {
        const status = searchParams.get("status");
        const cancel = searchParams.get("cancel");
        const amount = parseInt(searchParams.get("amount"));

        if (!hasUpdated.current && status === "PAID" && cancel === "false" && !isNaN(amount)) {
            const newWalletAmount = currentWalletAmount + amount;
            dispatch(updateWallet(newWalletAmount));
            hasUpdated.current = true; // Đánh dấu đã cập nhật
        }
    }, [searchParams, dispatch]);

    const handleGoHome = () => {
        navigate("/");
    };

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h2>🎉 Nạp tiền thành công!</h2>
            <p>Số dư ví của bạn đã được cập nhật.</p>
            <button
                onClick={handleGoHome}
                style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    fontSize: "16px",
                    cursor: "pointer",
                }}
            >
                Về trang chủ
            </button>
        </div>
    );
}
