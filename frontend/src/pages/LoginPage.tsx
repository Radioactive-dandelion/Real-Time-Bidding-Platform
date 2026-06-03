import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { API_URL } from "../config"

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

            const formData = new URLSearchParams()
            formData.append("username", email)
            formData.append("password", password)

            const response = await fetch(
                `${API_URL}/auth/login`,
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
        setErrorMessage("")

        try {

            const response = await fetch(
                `${API_URL}/auth/2fa/validate`,
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
        border: "1px solid #d4b896",
        backgroundColor: "#fdf6ec",
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
                    width: "420px",
                    padding: "48px 40px",
                    borderRadius: "20px",
                    backgroundColor: "#fdf6ec",
                    border: "1px solid #d4b896",
                    boxShadow: "0 4px 20px rgba(122,91,62,0.1)",
                }}
            >

                <h1
                    style={{
                        textAlign: "center",
                        marginBottom: "32px",
                        fontFamily: "'Playfair Display', Georgia, serif",
                        color: "#7a5b3e",
                        fontSize: "32px",
                    }}
                >
                    {requires2fa ? "Two-Factor Auth" : "Welcome Back"}
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
                                    color: "#a47148",
                                    textAlign: "center",
                                    textDecoration: "none",
                                    fontSize: "15px",
                                }}
                            >
                                Create account
                            </Link>
                        </>
                    ) : (
                        <>
                            <p
                                style={{
                                    color: "#a47148",
                                    textAlign: "center",
                                    margin: "0",
                                    fontSize: "15px",
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
                                    fontSize: "28px",
                                    letterSpacing: "10px",
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
                                    border: "1px solid #d4b896",
                                    color: "#a47148",
                                }}
                            >
                                Back
                            </button>
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

        </div>
    )
}

export default LoginPage