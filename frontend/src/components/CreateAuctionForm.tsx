import { useState } from "react"
import { API_URL } from "../config"

type Props = {
    onAuctionCreated?: () => void
}

function CreateAuctionForm({ onAuctionCreated }: Props) {

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [startingPrice, setStartingPrice] = useState("")
    const [reservePrice, setReservePrice] = useState("")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const createAuction = async () => {

        setErrorMessage("")
        setLoading(true)

        try {

            const response = await fetch(
                `${API_URL}/auctions/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        starting_price: Number(startingPrice),
                        reserve_price: Number(reservePrice),
                        start_time: new Date(startTime).toISOString(),
                        end_time: new Date(endTime).toISOString(),
                    }),
                }
            )

            if (!response.ok) {
                const error = await response.json()
                setErrorMessage(
                    typeof error.detail === "string"
                        ? error.detail
                        : "Failed to create auction"
                )
                setLoading(false)
                return
            }

            setTitle("")
            setDescription("")
            setStartingPrice("")
            setReservePrice("")
            setStartTime("")
            setEndTime("")

            if (onAuctionCreated) onAuctionCreated()

        } catch {
            setErrorMessage("Failed to create auction")
        }

        setLoading(false)
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

    return (
        <div
            style={{
                border: "1px solid #d4b896",
                borderRadius: "20px",
                padding: "40px",
                maxWidth: "600px",
                margin: "0 auto",
                backgroundColor: "#fdf6ec",
                boxShadow: "0 4px 20px rgba(122,91,62,0.1)",
            }}
        >

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
                    placeholder="Starting Price"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
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
                    Start Time
                </label>
                <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
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
                    onClick={createAuction}
                    disabled={loading}
                    style={{
                        padding: "14px",
                        borderRadius: "10px",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                        backgroundColor: loading ? "#c4a882" : "#7a5b3e",
                        color: "#fff1d9",
                        fontWeight: "bold",
                        fontSize: "16px",
                        marginTop: "8px",
                    }}
                >
                    {loading ? "Creating..." : "Create Auction"}
                </button>

                {errorMessage && (
                    <div
                        style={{
                            color: "#c84444",
                            backgroundColor: "#f9e8e8",
                            padding: "14px",
                            borderRadius: "10px",
                            fontSize: "14px",
                            border: "1px solid #d4a0a0",
                        }}
                    >
                        {errorMessage}
                    </div>
                )}

            </div>

        </div>
    )
}

export default CreateAuctionForm