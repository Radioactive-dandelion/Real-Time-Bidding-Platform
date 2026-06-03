import { useState } from "react"
import { API_URL } from "../config"

type Props = {
    auctionId: string
    disabled?: boolean
}

function BidForm({ auctionId, disabled = false }: Props) {

    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleBid = async () => {

        const token = localStorage.getItem("token")

        if (!token) {
            setError("You must be logged in to place bids")
            return
        }

        setError("")
        setSuccess("")
        setLoading(true)

        try {

            const response = await fetch(
                `${API_URL}/auctions/${auctionId}/bids`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        amount: Number(amount),
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setError(data.detail || "Failed to place bid")
                setLoading(false)
                return
            }

            setSuccess("Bid placed successfully!")
            setAmount("")

        } catch {
            setError("Server error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ marginTop: "24px" }}>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                    flexWrap: "wrap" as const,
                }}
            >

                <input
                    type="number"
                    placeholder="Enter bid amount"
                    value={amount}
                    disabled={loading || disabled}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: "1px solid #d4b896",
                        backgroundColor: "#fff1d9",
                        color: "#7a5b3e",
                        fontSize: "16px",
                        width: "200px",
                        outline: "none",
                        opacity: disabled ? 0.6 : 1,
                    }}
                />

                <button
                    onClick={handleBid}
                    disabled={loading || disabled}
                    style={{
                        padding: "12px 24px",
                        borderRadius: "10px",
                        border: "none",
                        backgroundColor: disabled ? "#c4a882" : "#7a5b3e",
                        color: "#fff1d9",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: disabled ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Submitting..." : "Place Bid"}
                </button>

            </div>

            {error && (
                <div
                    style={{
                        color: "#c84444",
                        marginTop: "14px",
                        fontSize: "15px",
                        textAlign: "center",
                    }}
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    style={{
                        color: "#109748",
                        marginTop: "14px",
                        fontSize: "15px",
                        textAlign: "center",
                        fontWeight: "600",
                    }}
                >
                    {success}
                </div>
            )}

        </div>
    )
}

export default BidForm