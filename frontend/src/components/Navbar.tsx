import { Link, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"

function Navbar() {

    const navigate = useNavigate()

    const token = localStorage.getItem("token")

    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate("/login")
    }

    const linkStyle = {
        color: "#fff1d9",
        textDecoration: "none",
        fontSize: "15px",
        opacity: 0.85,
    }

    return (
        <div
            style={{
                width: "100%",
                padding: "18px 40px",
                backgroundColor: "#7a5b3e",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxSizing: "border-box" as const,
            }}
        >

            <Link
                to="/"
                style={{
                    color: "#fff1d9",
                    textDecoration: "none",
                    fontSize: "24px",
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                }}
            >
                Auction Platform
            </Link>

            <div
                style={{
                    display: "flex",
                    gap: "24px",
                    alignItems: "center",
                }}
            >

                {!token ? (
                    <>
                        <Link to="/login" style={linkStyle}>Login</Link>
                        <Link to="/register" style={linkStyle}>Register</Link>
                    </>
                ) : (
                    <>
                        <Link to="/history" style={linkStyle}>History</Link>
                        <Link to="/create-auction" style={linkStyle}>Create Auction</Link>
                        <Link to="/settings/2fa" style={linkStyle}>2FA Settings</Link>

                        <button
                            onClick={handleLogout}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "1px solid rgba(255,241,217,0.4)",
                                backgroundColor: "transparent",
                                color: "#fff1d9",
                                cursor: "pointer",
                                fontSize: "14px",
                            }}
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </>
                )}

            </div>

        </div>
    )
}

export default Navbar