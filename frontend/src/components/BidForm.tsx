import { useState } from "react"

type Props = {
    auctionId: string
}

function BidForm({ auctionId }: Props) {

    const [amount, setAmount] = useState("")

    const [loading, setLoading] = useState(false)

    const [error, setError] = useState("")

    const [success, setSuccess] = useState("")

    const handleBid = async () => {

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
                onChange={(e) => setAmount(e.target.value)}
                style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #475569",
                    marginRight: "10px",
                    width: "220px",
                    fontSize: "16px",
                }}
            />

            <button
                onClick={handleBid}
                disabled={loading}
                style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "white",
                    fontSize: "16px",
                    cursor: "pointer",
                }}
            >
                {loading ? "Submitting..." : "Place Bid"}
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