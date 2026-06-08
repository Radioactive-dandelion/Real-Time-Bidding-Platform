import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { API_URL } from "../config"

type Bid = {
    id: string
    auction_id: string
    bidder_id: string
    amount: number
    created_at: string
}

function BidHistoryPage() {

    const { id } = useParams()

    const [bids, setBids] = useState<Bid[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        if (!id) return

        fetch(`${API_URL}/auctions/${id}/bids`)
            .then((res) => res.json())
            .then((data) => {
                setBids(data)
                setLoading(false)
            })

    }, [id])

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
                Loading bids...
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

            <Link
                to={`/auction/${id}`}
                style={{
                    color: "#a47148",
                    textDecoration: "none",
                    fontSize: "16px",
                }}
            >
                ← Back to auction
            </Link>

            <h1
                style={{
                    textAlign: "center",
                    fontSize: "40px",
                    marginBottom: "40px",
                    fontFamily: "'Playfair Display', Georgia, serif",
                }}
            >
                Bid History
            </h1>

            <div style={{ maxWidth: "700px", margin: "0 auto" }}>

                {bids.length === 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            color: "#a47148",
                            fontSize: "18px",
                        }}
                    >
                        No bids yet
                    </div>
                )}

                {bids.map((bid, index) => (

                    <div
                        key={bid.id}
                        style={{
                            border: "1px solid #d4b896",
                            borderRadius: "12px",
                            padding: "20px 24px",
                            marginBottom: "12px",
                            backgroundColor: index === 0 ? "#fdf0e0" : "#fdf6ec",
                            boxShadow: "0 2px 8px rgba(122,91,62,0.08)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >

                        <div>
                            <div
                                style={{
                                    fontSize: "22px",
                                    fontWeight: "700",
                                    fontFamily: "'Playfair Display', Georgia, serif",
                                    color: index === 0 ? "#7a5b3e" : "#a47148",
                                }}
                            >
                                ${bid.amount}
                                {index === 0 && (
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            fontFamily: "sans-serif",
                                            marginLeft: "10px",
                                            backgroundColor: "#7a5b3e",
                                            color: "#fff1d9",
                                            padding: "2px 8px",
                                            borderRadius: "6px",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Highest
                                    </span>
                                )}
                            </div>
                        </div>

                        <div
                            style={{
                                fontSize: "13px",
                                color: "#a47148",
                                textAlign: "right",
                            }}
                        >
                            {new Date(bid.created_at).toLocaleString()}
                        </div>

                    </div>

                ))}

            </div>

        </div>
    )
}

export default BidHistoryPage