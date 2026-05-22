import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"

import BidForm from "../components/BidForm"
import CountdownTimer from "../components/CountdownTimer"

type Auction = {
    id: string
    title: string
    description: string
    current_price: number
    status: string
    end_time: string
}

function AuctionDetailPage() {

    const { id } = useParams()

    const [auction, setAuction] = useState<Auction | null>(null)

    const [loading, setLoading] = useState(true)

    useEffect(() => {

        if (!id) return

        fetch(`http://127.0.0.1:8000/auctions/${id}`)
            .then((res) => res.json())
            .then((data) => {

                setAuction(data)

                setLoading(false)
            })

    }, [id])

    useEffect(() => {

        if (!id) return

        const ws = new WebSocket(
            `ws://127.0.0.1:8000/ws/auctions/${id}`
        )

        ws.onopen = () => {
            console.log("WebSocket connected")
        }

        ws.onmessage = (event) => {

            const data = JSON.parse(event.data)

            if (data.event === "NEW_BID") {

                setAuction((prev) => {

                    if (!prev) return prev

                    return {
                        ...prev,
                        current_price: data.amount,
                    }
                })
            }
        }

        ws.onerror = (error) => {
            console.log("WebSocket error")
            console.log(error)
        }

        ws.onclose = () => {
            console.log("WebSocket disconnected")
        }

        return () => {
            ws.close()
        }

    }, [id])

    if (loading || !auction) {

        return (
            <div
                style={{
                    backgroundColor: "#0f172a",
                    minHeight: "100vh",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "32px",
                    fontWeight: "bold",
                }}
            >
                Loading auction...
            </div>
        )
    }

    return (
        <div
            style={{
                backgroundColor: "#0f172a",
                minHeight: "100vh",
                color: "white",
                padding: "40px",
            }}
        >

            <Link
                to="/"
                style={{
                    color: "#60a5fa",
                    textDecoration: "none",
                    fontSize: "18px",
                }}
            >
                ← Back to auctions
            </Link>

            <div
                style={{
                    maxWidth: "900px",
                    margin: "40px auto",
                    border: "1px solid #334155",
                    borderRadius: "20px",
                    padding: "40px",
                    backgroundColor: "#111827",
                    textAlign: "center",
                }}
            >

                <h1
                    style={{
                        fontSize: "48px",
                        marginBottom: "20px",
                    }}
                >
                    {auction.title}
                </h1>

                <p
                    style={{
                        fontSize: "22px",
                        color: "#cbd5e1",
                        marginBottom: "30px",
                    }}
                >
                    {auction.description}
                </p>

                <div
                    style={{
                        fontSize: "42px",
                        fontWeight: "bold",
                        marginBottom: "20px",
                    }}
                >
                    ${auction.current_price}
                </div>

                <div
                    style={{
                        fontSize: "20px",
                        marginBottom: "20px",
                        color:
                            auction.status === "ACTIVE"
                                ? "#4ade80"
                                : auction.status === "CLOSED"
                                    ? "#f87171"
                                    : "#facc15",

                        fontWeight: "bold",
                    }}
                >
                    Status: {auction.status}
                </div>

                <div
                    style={{
                        marginBottom: "30px",
                    }}
                >
                    <CountdownTimer endTime={auction.end_time} />
                </div>

                {auction.status !== "CLOSED" ? (

                    <BidForm auctionId={auction.id} />

                ) : (

                    <div
                        style={{
                            marginTop: "30px",
                            color: "#f87171",
                            fontSize: "24px",
                            fontWeight: "bold",
                        }}
                    >
                        Auction closed
                    </div>
                )}

            </div>

        </div>
    )
}

export default AuctionDetailPage