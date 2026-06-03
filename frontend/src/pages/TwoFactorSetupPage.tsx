import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { API_URL } from "../config"

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
                `${API_URL}/auth/2fa/setup`,
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
                `${API_URL}/auth/2fa/verify-setup`,
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
        border: "1px solid #d4b896",
        backgroundColor: "#fff1d9",
        color: "#7a5b3e",
        fontSize: "16px",
        outline: "none",
    }

    const buttonStyle = (disabled: boolean) => ({
        padding: "14px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: disabled ? "#c4a882" : "#7a5b3e",
        color: "#fff1d9",
        fontWeight: "bold" as const,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "16px",
    })

    return (
        <div
            style={{
                backgroundColor: "#fff1d9",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >

            <div
                style={{
                    width: "460px",
                    padding: "48px 40px",
                    borderRadius: "20px",
                    backgroundColor: "#fdf6ec",
                    border: "1px solid #d4b896",
                    boxShadow: "0 4px 20px rgba(122,91,62,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}
            >

                <h1
                    style={{
                        textAlign: "center",
                        margin: "0",
                        fontSize: "28px",
                        fontFamily: "'Playfair Display', Georgia, serif",
                        color: "#7a5b3e",
                    }}
                >
                    Two-Factor Authentication
                </h1>

                {step === "idle" && (
                    <>
                        <p style={{ color: "#a47148", textAlign: "center", margin: "0", fontSize: "15px" }}>
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
                        <p style={{ color: "#a47148", textAlign: "center", margin: "0", fontSize: "15px" }}>
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
                                    border: "1px solid #d4b896",
                                }}
                            />
                        </div>

                        <p style={{ color: "#a47148", textAlign: "center", fontSize: "13px", margin: "0" }}>
                            Or enter the key manually:
                        </p>

                        <div
                            style={{
                                backgroundColor: "#fff1d9",
                                padding: "12px",
                                borderRadius: "10px",
                                textAlign: "center",
                                fontFamily: "monospace",
                                fontSize: "13px",
                                letterSpacing: "2px",
                                color: "#7a5b3e",
                                wordBreak: "break-all" as const,
                                border: "1px solid #d4b896",
                            }}
                        >
                            {secret}
                        </div>

                        <p style={{ color: "#a47148", textAlign: "center", margin: "0", fontSize: "15px" }}>
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
                                fontSize: "28px",
                                letterSpacing: "10px",
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
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <ShieldCheck size={64} color="#109748" />
                        </div>

                        <p
                            style={{
                                color: "#109748",
                                textAlign: "center",
                                fontSize: "18px",
                                margin: "0",
                                fontWeight: "600",
                                fontFamily: "'Playfair Display', Georgia, serif",
                            }}
                        >
                            2FA enabled successfully!
                        </p>

                        <p style={{ color: "#a47148", textAlign: "center", margin: "0", fontSize: "15px" }}>
                            From now on you will need your authenticator app every time you log in.
                        </p>
                    </>
                )}

                {errorMessage && (
                    <div
                        style={{
                            color: "#c84444",
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