import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { API_URL } from "../config"

function RegisterPage() {

    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const register = async () => {

        setLoading(true)
        setErrorMessage("")

        try {

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setErrorMessage(
                    typeof data.detail === "string"
                        ? data.detail
                        : "Registration failed"
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
                    Create Account
                </h1>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                    }}
                >

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
                        onClick={register}
                        disabled={loading}
                        style={{
                            padding: "14px",
                            borderRadius: "10px",
                            border: "none",
                            backgroundColor: loading ? "#c4a882" : "#7a5b3e",
                            color: "#fff1d9",
                            fontWeight: "bold",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: "16px",
                        }}
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>

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

                    <Link
                        to="/login"
                        style={{
                            color: "#a47148",
                            textAlign: "center",
                            textDecoration: "none",
                            fontSize: "15px",
                        }}
                    >
                        Already have an account?
                    </Link>

                </div>

            </div>

        </div>
    )
}

export default RegisterPage