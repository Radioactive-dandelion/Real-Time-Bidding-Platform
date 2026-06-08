import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { API_URL, WS_URL } from "../config"

import BidForm from "../components/BidForm"
import CountdownTimer from "../components/CountdownTimer"

type Auction = {
    id: string
    title: string
    description: string
    current_price: number
    status: string
    start_time: string
    end_time: string
    winner_id: string | null
}

function AuctionDetailPage() {

    const { id } = useParams()
    const navigate = useNavigate()

    const [auction, setAuction] = useState<Auction | null>(null)
    const [loading, setLoading] = useState(true)
    const [winnerId, setWinnerId] = useState<string | null>(null)
    const [reserveMet, setReserveMet] = useState<boolean | null>(null)

    useEffect(() => {

        if (!id) return

        fetch(`${API_URL}/auctions/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setAuction(data)
                if (data.winner_id) setWinnerId(data.winner_id)
                setLoading(false)
            })

    }, [id])

    useEffect(() => {

        if (!id) return

        const ws = new WebSocket(
            `${WS_URL}/ws/auctions/${id}`
        )

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.event === "NEW_BID") {
                setAuction((prev) => {
                    if (!prev) return prev
                    return { ...prev, current_price: data.amount }
                })
            }

            if (data.event === "AUCTION_CLOSED") {
                setWinnerId(data.winner_id)
                setReserveMet(data.reserve_met)
                setAuction((prev) => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        status: "closed",
                        current_price: data.final_price,
                    }
                })
            }
        }

        return () => ws.close()

    }, [id])

    const statusColor = (status: string) => {
        if (status === "active") return "#3a7a55"
        if (status === "closed") return "#a03030"
        if (status === "cancelled") return "#a03030"
        return "#8a5a20"
    }

    if (loading || !auction) {
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
                Loading auction...
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
                to="/"
                style={{
                    color: "#a47148",
                    textDecoration: "none",
                    fontSize: "16px",
                }}
            >
                ← Back to auctions
            </Link>

            <div
                style={{
                    maxWidth: "700px",
                    margin: "40px auto",
                    border: "1px solid #d4b896",
                    borderRadius: "20px",
                    padding: "48px 40px",
                    backgroundColor: "#fdf6ec",
                    boxShadow: "0 4px 20px rgba(122,91,62,0.1)",
                    textAlign: "center",
                }}
            >

                <h1
                    style={{
                        fontSize: "40px",
                        marginBottom: "12px",
                        fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                >
                    {auction.title}
                </h1>

                <p
                    style={{
                        fontSize: "18px",
                        color: "#a47148",
                        marginBottom: "28px",
                    }}
                >
                    {auction.description}
                </p>

                <div
                    style={{
                        fontSize: "42px",
                        fontWeight: "700",
                        marginBottom: "12px",
                        fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                >
                    ${auction.current_price}
                </div>

                <div
                    style={{
                        fontSize: "12px",
                        marginBottom: "16px",
                        color: statusColor(auction.status),
                        fontWeight: "700",
                        textTransform: "uppercase" as const,
                        letterSpacing: "1px",
                    }}
                >
                    {auction.status}
                </div>

                <div style={{ marginBottom: "16px" }}>
                    <CountdownTimer
                        endTime={auction.end_time}
                        startTime={auction.start_time}
                        status={auction.status}
                    />
                </div>

                <button
                    onClick={() => navigate(`/auction/${id}/bids`)}
                    style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        border: "1px solid #d4b896",
                        backgroundColor: "transparent",
                        color: "#a47148",
                        cursor: "pointer",
                        fontSize: "14px",
                        marginBottom: "24px",
                    }}
                >
                    View Bid History
                </button>

                {auction.status === "active" ? (

                    <BidForm auctionId={auction.id} />

                ) : auction.status === "closed" ? (

                    <div
                        style={{
                            fontSize: "18px",
                            fontFamily: "'Playfair Display', Georgia, serif",
                        }}
                    >
                        <div
                            style={{
                                color: "#a03030",
                                fontWeight: "600",
                                marginBottom: "12px",
                            }}
                        >
                            This auction has ended
                        </div>

                        {winnerId ? (
                            <div
                                style={{
                                    color: "#3a7a55",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    padding: "12px",
                                    backgroundColor: "#eaf4ee",
                                    borderRadius: "10px",
                                    border: "1px solid #b0d4bb",
                                }}
                            >
                                Winner determined
                            </div>
                        ) : reserveMet === false ? (
                            <div
                                style={{
                                    color: "#a03030",
                                    fontSize: "15px",
                                    padding: "12px",
                                    backgroundColor: "#f9e8e8",
                                    borderRadius: "10px",
                                    border: "1px solid #d4a0a0",
                                }}
                            >
                                Reserve price was not met — auction failed
                            </div>
                        ) : (
                            <div
                                style={{
                                    color: "#a47148",
                                    fontSize: "15px",
                                }}
                            >
                                No bids were placed
                            </div>
                        )}
                    </div>

                ) : auction.status === "cancelled" ? (

                    <div
                        style={{
                            color: "#a03030",
                            fontSize: "20px",
                            fontWeight: "600",
                            fontFamily: "'Playfair Display', Georgia, serif",
                        }}
                    >
                        This auction was cancelled
                    </div>

                ) : (

                    <div
                        style={{
                            color: "#8a5a20",
                            fontSize: "20px",
                            fontWeight: "600",
                            fontFamily: "'Playfair Display', Georgia, serif",
                        }}
                    >
                        Auction has not started yet
                    </div>

                )}

            </div>

        </div>
    )
}

export default AuctionDetailPage