import { useState } from "react"

function TwoFactorSetupPage() {

    const [qrCode, setQrCode] = useState("")
    const [secret, setSecret] = useState("")
    const [otpCode, setOtpCode] = useState("")

    const [step, setStep] = useState<"idle" | "scan" | "done">("idle")

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const setup2fa = async () => {

        setLoading(true)
        setErrorMessage("")

        try {

            const token = localStorage.getItem("token")

            const response = await fetch(
                "http://127.0.0.1:8000/auth/2fa/setup",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setErrorMessage(data.detail || "Setup failed")
                setLoading(false)
                return
            }

            setQrCode(data.qr_code)
            setSecret(data.secret)
            setStep("scan")

        } catch {
            setErrorMessage("Server error")
        }

        setLoading(false)
    }

    const verify2fa = async () => {

        setLoading(true)
        setErrorMessage("")

        try {

            const token = localStorage.getItem("token")

            const response = await fetch(
                "http://127.0.0.1:8000/auth/2fa/verify-setup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ code: otpCode }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setErrorMessage(data.detail || "Invalid code")
                setLoading(false)
                return
            }

            setStep("done")

        } catch {
            setErrorMessage("Server error")
        }

        setLoading(false)
    }

    const inputStyle = {
        padding: "14px",
        borderRadius: "10px",
        border: "1px solid #334155",
        backgroundColor: "#1e293b",
        color: "white",
        fontSize: "16px",
    }

    const buttonStyle = (disabled: boolean) => ({
        padding: "14px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: disabled ? "#475569" : "#2563eb",
        color: "white",
        fontWeight: "bold",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "16px",
    })

    return (
        <div
            style={{
                backgroundColor: "#0f172a",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
            }}
        >

            <div
                style={{
                    width: "440px",
                    padding: "40px",
                    borderRadius: "20px",
                    backgroundColor: "#111827",
                    border: "1px solid #334155",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}
            >

                <h1 style={{ textAlign: "center", margin: "0", fontSize: "30px" }}>
    Two-Factor Authentication
</h1>

                {step === "idle" && (
                    <>
                        <p style={{ color: "#94a3b8", textAlign: "center", margin: "0" }}>
                            Add an extra layer of security to your account.
                            You will need Google Authenticator or any TOTP app.
                        </p>

                        <button
                            onClick={setup2fa}
                            disabled={loading}
                            style={buttonStyle(loading)}
                        >
                            {loading ? "Generating..." : "Enable 2FA"}
                        </button>
                    </>
                )}

                {step === "scan" && (
                    <>
                        <p style={{ color: "#94a3b8", textAlign: "center", margin: "0" }}>
                            Scan this QR code with your authenticator app
                        </p>

                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <img
                                src={`data:image/png;base64,${qrCode}`}
                                alt="QR Code"
                                style={{
                                    width: "200px",
                                    height: "200px",
                                    borderRadius: "10px",
                                }}
                            />
                        </div>

                        <p style={{ color: "#64748b", textAlign: "center", fontSize: "13px", margin: "0" }}>
                            Or enter the key manually:
                        </p>

                        <div
                            style={{
                                backgroundColor: "#1e293b",
                                padding: "12px",
                                borderRadius: "10px",
                                textAlign: "center",
                                fontFamily: "monospace",
                                fontSize: "14px",
                                letterSpacing: "2px",
                                color: "#60a5fa",
                                wordBreak: "break-all",
                            }}
                        >
                            {secret}
                        </div>

                        <p style={{ color: "#94a3b8", textAlign: "center", margin: "0" }}>
                            Enter the 6-digit code from the app to confirm
                        </p>

                        <input
                            type="text"
                            placeholder="000000"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            maxLength={6}
                            style={{
                                ...inputStyle,
                                textAlign: "center",
                                fontSize: "24px",
                                letterSpacing: "8px",
                            }}
                        />

                        <button
                            onClick={verify2fa}
                            disabled={loading}
                            style={buttonStyle(loading)}
                        >
                            {loading ? "Verifying..." : "Confirm"}
                        </button>
                    </>
                )}

                {step === "done" && (
                    <>
                        <div
                            style={{
                                textAlign: "center",
                                fontSize: "48px",
                            }}
                        >
                            ✅
                        </div>

                        <p
                            style={{
                                color: "#4ade80",
                                textAlign: "center",
                                fontSize: "18px",
                                margin: "0",
                            }}
                        >
                            2FA enabled successfully!
                        </p>

                        <p style={{ color: "#94a3b8", textAlign: "center", margin: "0" }}>
                            From now on you will need your authenticator app every time you log in.
                        </p>
                    </>
                )}

                {errorMessage && (
                    <div
                        style={{
                            color: "#f87171",
                            textAlign: "center",
                            fontSize: "15px",
                        }}
                    >
                        {errorMessage}
                    </div>
                )}

            </div>

        </div>
    )
}

export default TwoFactorSetupPage