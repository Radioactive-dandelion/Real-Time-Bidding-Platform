import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { API_URL } from "../config"

function EditAuctionPage() {

    const { id } = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [reservePrice, setReservePrice] = useState("")
    const [endTime, setEndTime] = useState("")

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {

        fetch(`${API_URL}/auctions/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setTitle(data.title)
                setDescription(data.description || "")
                setReservePrice(String(data.reserve_price))
                setEndTime(
                    new Date(data.end_time)
                        .toISOString()
                        .slice(0, 16)
                )
                setLoading(false)
            })

    }, [id])

    const save = async () => {

        setSaving(true)
        setErrorMessage("")

        try {

            const token = localStorage.getItem("token")

            const response = await fetch(
                `${API_URL}/auctions/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        reserve_price: Number(reservePrice),
                        end_time: new Date(endTime).toISOString(),
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setErrorMessage(
                    typeof data.detail === "string"
                        ? data.detail
                        : "Failed to update auction"
                )
                setSaving(false)
                return
            }

            navigate("/")

        } catch {
            setErrorMessage("Server error")
        }

        setSaving(false)
    }

    const inputStyle = {
        width: "100%",
        padding: "14px",
        borderRadius: "10px",
        border: "1px solid #d4b896",
        backgroundColor: "#fff1d9",
        color: "#7a5b3e",
        fontSize: "16px",
        boxSizing: "border-box" as const,
        outline: "none",
    }

    if (loading) {
        return (
            <div
                style={{
                    backgroundColor: "#fff1d9",
                    minHeight: "100vh",
                    color: "#7a5b3e",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "24px",
                    fontFamily: "'Playfair Display', Georgia, serif",
                }}
            >
                Loading...
            </div>
        )
    }

    return (
        <div
            style={{
                backgroundColor: "#fff1d9",
                minHeight: "100vh",
                color: "#7a5b3e",
                padding: "40px",
            }}
        >

            <div
                style={{
                    maxWidth: "600px",
                    margin: "0 auto",
                    border: "1px solid #d4b896",
                    borderRadius: "20px",
                    padding: "48px 40px",
                    backgroundColor: "#fdf6ec",
                    boxShadow: "0 4px 20px rgba(122,91,62,0.1)",
                }}
            >

                <h1
                    style={{
                        textAlign: "center",
                        fontSize: "36px",
                        marginBottom: "32px",
                        fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                >
                    Edit Auction
                </h1>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                    }}
                >

                    <input
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        type="number"
                        placeholder="Reserve Price"
                        value={reservePrice}
                        onChange={(e) => setReservePrice(e.target.value)}
                        style={inputStyle}
                    />

                    <label style={{ color: "#a47148", fontSize: "14px", marginBottom: "-8px" }}>
                        End Time
                    </label>

                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={inputStyle}
                    />

                    <button
                        onClick={save}
                        disabled={saving}
                        style={{
                            padding: "14px",
                            borderRadius: "10px",
                            border: "none",
                            backgroundColor: saving ? "#c4a882" : "#7a5b3e",
                            color: "#fff1d9",
                            fontWeight: "bold",
                            cursor: saving ? "not-allowed" : "pointer",
                            fontSize: "16px",
                        }}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        style={{
                            padding: "14px",
                            borderRadius: "10px",
                            border: "1px solid #d4b896",
                            backgroundColor: "transparent",
                            color: "#a47148",
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "16px",
                        }}
                    >
                        Cancel
                    </button>

                    {errorMessage && (
                        <div
                            style={{
                                color: "#a03030",
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

export default EditAuctionPage