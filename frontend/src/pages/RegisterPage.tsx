import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

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
                "http://127.0.0.1:8000/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {

                setErrorMessage(
                    data.detail || "Registration failed"
                )

                setLoading(false)

                return
            }

            localStorage.setItem(
                "token",
                data.access_token
            )

            navigate("/")

        } catch {

            setErrorMessage("Server error")
        }

        setLoading(false)
    }

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
                    Register
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
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        style={{
                            padding: "14px",
                            borderRadius: "10px",
                            border: "1px solid #334155",
                            backgroundColor: "#1e293b",
                            color: "white",
                            fontSize: "16px",
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        style={{
                            padding: "14px",
                            borderRadius: "10px",
                            border: "1px solid #334155",
                            backgroundColor: "#1e293b",
                            color: "white",
                            fontSize: "16px",
                        }}
                    />

                    <button
                        onClick={register}
                        disabled={loading}
                        style={{
                            padding: "14px",
                            borderRadius: "10px",
                            border: "none",
                            backgroundColor: loading
                                ? "#475569"
                                : "#2563eb",
                            color: "white",
                            fontWeight: "bold",
                            cursor: loading
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "16px",
                        }}
                    >
                        {loading
                            ? "Creating account..."
                            : "Register"}
                    </button>

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

                    <Link
                        to="/login"
                        style={{
                            color: "#60a5fa",
                            textAlign: "center",
                            textDecoration: "none",
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