import { useState } from "react"

type Props = {
    auctionId: string
    disabled?: boolean
}

function BidForm({
    auctionId,
    disabled = false,
}: Props) {

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
                `http://127.0.0.1:8000/auctions/${auctionId}/bids`,
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

        } catch (err) {

            setError("Server error")

        } finally {

            setLoading(false)
        }
    }

    return (
        <div
            style={{
                marginTop: "30px",
            }}
        >

            <input
                type="number"
                placeholder="Enter bid amount"
                value={amount}
                disabled={loading || disabled}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #475569",
                    marginRight: "10px",
                    width: "220px",
                    fontSize: "16px",
                    opacity: disabled ? 0.6 : 1,
                }}
            />

            <button
                onClick={handleBid}
                disabled={loading || disabled}
                style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: disabled
                        ? "#475569"
                        : "#2563eb",
                    color: "white",
                    fontSize: "16px",
                    cursor: disabled
                        ? "not-allowed"
                        : "pointer",
                }}
            >
                {loading
                    ? "Submitting..."
                    : disabled
                    ? "Auction Closed"
                    : "Place Bid"}
            </button>

            {error && (

                <div
                    style={{
                        color: "#f87171",
                        marginTop: "15px",
                        fontSize: "16px",
                    }}
                >
                    {error}
                </div>
            )}

            {success && (

                <div
                    style={{
                        color: "#4ade80",
                        marginTop: "15px",
                        fontSize: "16px",
                    }}
                >
                    {success}
                </div>
            )}

        </div>
    )
}

export default BidForm