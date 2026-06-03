import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../config"

type Auction = {
    id: string
    title: string
    description: string
    current_price: number
    status: string
    start_time: string
    end_time: string
    seller_id: string
}

function HistoryPage() {

    const navigate = useNavigate()

    const [auctions, setAuctions] = useState<Auction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const token = localStorage.getItem("token")

        fetch(`${API_URL}/auctions/archived`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setAuctions(data)
                setLoading(false)
            })

    }, [])

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
                Loading history...
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

            <h1
                style={{
                    textAlign: "center",
                    fontSize: "44px",
                    marginBottom: "40px",
                    fontFamily: "'Playfair Display', Georgia, serif",
                }}
            >
                Auction History
            </h1>

            <div style={{ maxWidth: "700px", margin: "0 auto" }}>

                {auctions.length === 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "100px",
                            color: "#a47148",
                        }}
                    >
                        <h2 style={{ fontSize: "28px", marginBottom: "12px" }}>
                            No archived auctions yet
                        </h2>
                        <p style={{ fontSize: "16px" }}>
                            Archived auctions will appear here
                        </p>
                    </div>
                )}

                {auctions.map((auction) => (

                    <div
                        key={auction.id}
                        style={{
                            border: "1px solid #d4b896",
                            borderRadius: "16px",
                            padding: "28px",
                            marginBottom: "20px",
                            backgroundColor: "#fdf6ec",
                            boxShadow: "0 2px 8px rgba(122,91,62,0.08)",
                            textAlign: "center" as const,
                        }}
                    >

                        <h2
                            style={{
                                fontSize: "24px",
                                marginBottom: "8px",
                                fontFamily: "'Playfair Display', Georgia, serif",
                            }}
                        >
                            {auction.title}
                        </h2>

                        <p
                            style={{
                                color: "#a47148",
                                fontSize: "15px",
                                marginBottom: "16px",
                            }}
                        >
                            {auction.description}
                        </p>

                        <div
                            style={{
                                fontSize: "24px",
                                fontWeight: "700",
                                marginBottom: "8px",
                                fontFamily: "'Playfair Display', Georgia, serif",
                            }}
                        >
                            Final price: ${auction.current_price}
                        </div>

                        <div
                            style={{
                                color: "#a47148",
                                fontSize: "13px",
                                marginBottom: "20px",
                            }}
                        >
                            Ended: {new Date(auction.end_time).toLocaleDateString()}
                        </div>

                        <button
                            onClick={() => navigate(`/auction/${auction.id}`)}
                            style={{
                                padding: "10px 24px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "#7a5b3e",
                                color: "#fff1d9",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "14px",
                            }}
                        >
                            View Results
                        </button>

                    </div>

                ))}

            </div>

        </div>
    )
}

export default HistoryPage