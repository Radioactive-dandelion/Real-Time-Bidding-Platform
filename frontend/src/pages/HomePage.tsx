import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import CreateAuctionForm from "../components/CreateAuctionForm"
import CountdownTimer from "../components/CountdownTimer"

type Auction = {
    id: string
    title: string
    description: string
    current_price: number
    status: string
    end_time: string
}

function HomePage() {

    const [auctions, setAuctions] = useState<Auction[]>([])

    const [loading, setLoading] = useState(true)

    const fetchAuctions = () => {

        fetch("http://127.0.0.1:8000/auctions/")
            .then((res) => res.json())
            .then((data) => {

                setAuctions(data)

                setLoading(false)
            })
    }

    useEffect(() => {

        fetchAuctions()

    }, [])

    useEffect(() => {

        const sockets: WebSocket[] = []

        auctions.forEach((auction) => {

            const ws = new WebSocket(
                `ws://127.0.0.1:8000/ws/auctions/${auction.id}`
            )

            ws.onmessage = (event) => {

                const message = JSON.parse(event.data)

                if (message.event === "NEW_BID") {

                    setAuctions((prevAuctions) =>

                        prevAuctions.map((a) =>

                            a.id === message.auction_id
                                ? {
                                    ...a,
                                    current_price: message.amount,
                                }
                                : a
                        )
                    )
                }
            }

            sockets.push(ws)
        })

        return () => {

            sockets.forEach((socket) => {
                socket.close()
            })
        }

    }, [auctions])

    if (loading) {

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
                Loading auctions...
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

            <h1
                style={{
                    textAlign: "center",
                    fontSize: "60px",
                    marginBottom: "50px",
                }}
            >
                Real-Time Auctions
            </h1>

            <CreateAuctionForm onAuctionCreated={fetchAuctions} />

            <div
                style={{
                    maxWidth: "1000px",
                    margin: "0 auto",
                }}
            >

                {auctions.length === 0 && (

                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "100px",
                            color: "#94a3b8",
                        }}
                    >

                        <h2
                            style={{
                                fontSize: "36px",
                                marginBottom: "20px",
                            }}
                        >
                            No auctions yet
                        </h2>

                        <p
                            style={{
                                fontSize: "20px",
                            }}
                        >
                            Create the first auction
                        </p>

                    </div>
                )}

                {auctions.map((auction) => (

                    <Link
                        key={auction.id}
                        to={`/auction/${auction.id}`}
                        style={{
                            textDecoration: "none",
                            color: "white",
                        }}
                    >

                        <div
                            style={{
                                border: "1px solid #334155",
                                borderRadius: "20px",
                                padding: "30px",
                                marginBottom: "30px",
                                cursor: "pointer",
                                backgroundColor: "#111827",
                                transition: "0.2s",
                            }}
                        >

                            <h2
                                style={{
                                    fontSize: "32px",
                                    marginBottom: "15px",
                                }}
                            >
                                {auction.title}
                            </h2>

                            <p
                                style={{
                                    color: "#cbd5e1",
                                    fontSize: "18px",
                                    marginBottom: "20px",
                                }}
                            >
                                {auction.description}
                            </p>

                            <div
                                style={{
                                    fontSize: "28px",
                                    fontWeight: "bold",
                                    marginBottom: "10px",
                                }}
                            >
                                ${auction.current_price}
                            </div>

                            <div
                                style={{
                                    color:
                                        auction.status === "ACTIVE"
                                            ? "#4ade80"
                                            : auction.status === "CLOSED"
                                                ? "#f87171"
                                                : "#facc15",

                                    fontSize: "16px",
                                    marginBottom: "10px",
                                    fontWeight: "bold",
                                }}
                            >
                                Status: {auction.status}
                            </div>

                            <CountdownTimer endTime={auction.end_time} />

                        </div>

                    </Link>

                ))}

            </div>

        </div>
    )
}

export default HomePage