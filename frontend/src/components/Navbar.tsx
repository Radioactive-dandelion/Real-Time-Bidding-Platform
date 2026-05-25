import { Link, useNavigate } from "react-router-dom"

function Navbar() {

    const navigate = useNavigate()

    const token = localStorage.getItem("token")

    const handleLogout = () => {

        localStorage.removeItem("token")

        navigate("/login")
    }

    return (
        <div
            style={{
                width: "100%",
                padding: "20px 40px",
                backgroundColor: "#111827",
                borderBottom: "1px solid #334155",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxSizing: "border-box",
            }}
        >

            <Link
                to="/"
                style={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "28px",
                    fontWeight: "bold",
                }}
            >
                Auction Platform
            </Link>

            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                }}
            >

                {!token ? (
                    <>

                        <Link
                            to="/login"
                            style={{
                                color: "#60a5fa",
                                textDecoration: "none",
                                fontSize: "18px",
                            }}
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            style={{
                                color: "#60a5fa",
                                textDecoration: "none",
                                fontSize: "18px",
                            }}
                        >
                            Register
                        </Link>

                    </>
                ) : (
                    <>

                        <div
                            style={{
                                color: "#4ade80",
                                fontSize: "16px",
                            }}
                        >
                            Logged in
                        </div>

                        <button
                            onClick={handleLogout}
                            style={{
                                padding: "10px 18px",
                                borderRadius: "10px",
                                border: "none",
                                backgroundColor: "#dc2626",
                                color: "white",
                                cursor: "pointer",
                                fontWeight: "bold",
                            }}
                        >
                            Logout
                        </button>

                    </>
                )}

            </div>

        </div>
    )
}

export default Navbar