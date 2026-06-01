import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

function LoginPage() {

    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [otpCode, setOtpCode] = useState("")

    const [requires2fa, setRequires2fa] = useState(false)
    const [tempToken, setTempToken] = useState("")

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const login = async () => {

        setLoading(true)
        setErrorMessage("")

        try {

            // бэкенд ждёт form data, не JSON
            const formData = new URLSearchParams()
            formData.append("username", email)
            formData.append("password", password)

            const response = await fetch(
                "http://127.0.0.1:8000/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: formData.toString(),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setErrorMessage(
    typeof data.detail === "string"
        ? data.detail
        : "Login failed"
)
                setLoading(false)
                return
            }

            if (data.requires_2fa) {
                // первый шаг прошёл — показываем поле для кода
                setTempToken(data.temp_token)
                setRequires2fa(true)
                setLoading(false)
                return
            }

            localStorage.setItem("token", data.access_token)
            navigate("/")

        } catch {
            setErrorMessage("Server error")
        }

        setLoading(false)
    }

    const validate2fa = async () => {

        setLoading(true)
        

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/auth/2fa/validate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        temp_token: tempToken,
                        code: otpCode,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setErrorMessage(
    typeof data.detail === "string"
        ? data.detail
        : "Invalid code"
)
                setLoading(false)
                return
            }

            localStorage.setItem("token", data.access_token)
            navigate("/")

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
                    width: "400px",
                    padding: "40px",
                    borderRadius: "20px",
                    backgroundColor: "#111827",
                    border: "1px solid #334155",
                }}
            >

                <h1
                    style={{
                        textAlign: "center",
                        marginBottom: "30px",
                    }}
                >
                    {requires2fa ? "Two-Factor Auth" : "Login"}
                </h1>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                    }}
                >

                    {!requires2fa ? (
                        <>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={inputStyle}
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={inputStyle}
                            />

                            <button
                                onClick={login}
                                disabled={loading}
                                style={buttonStyle(loading)}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>

                            <Link
                                to="/register"
                                style={{
                                    color: "#60a5fa",
                                    textAlign: "center",
                                    textDecoration: "none",
                                }}
                            >
                                Create account
                            </Link>
                        </>
                    ) : (
                        <>
                            <p
                                style={{
                                    color: "#94a3b8",
                                    textAlign: "center",
                                    margin: "0",
                                }}
                            >
                                Enter the 6-digit code from your authenticator app
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
                                onClick={validate2fa}
                                disabled={loading}
                                style={buttonStyle(loading)}
                            >
                                {loading ? "Verifying..." : "Verify"}
                            </button>

                            <button
                                onClick={() => {
                                    setRequires2fa(false)
                                    setTempToken("")
                                    setOtpCode("")
                                    setErrorMessage("")
                                }}
                                style={{
                                    ...buttonStyle(false),
                                    backgroundColor: "transparent",
                                    border: "1px solid #334155",
                                    color: "#94a3b8",
                                }}
                            >
                                Back
                            </button>
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

        </div>
    )
}

export default LoginPage