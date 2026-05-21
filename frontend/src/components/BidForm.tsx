import { useState } from "react"

type Props = {
    auctionId: string
}

function BidForm({ auctionId }: Props) {

    const [amount, setAmount] = useState("")

    const placeBid = async () => {

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

        if (!response.ok) {

            const error = await response.json()

            alert(error.detail)

            return
        }

        setAmount("")
    }

    return (
        <div
            style={{
                marginTop: "20px",
            }}
        >

            <input
                type="number"
                placeholder="Enter bid amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    marginRight: "10px",
                    width: "200px",
                }}
            />

            <button
                onClick={placeBid}
                style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: "#22c55e",
                    color: "white",
                    fontWeight: "bold",
                }}
            >
                Place Bid
            </button>

        </div>
    )
}

export default BidForm