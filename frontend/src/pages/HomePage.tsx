import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Pencil, X, Archive } from "lucide-react"
import CountdownTimer from "../components/CountdownTimer"
import { API_URL, WS_URL } from "../config"

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

function HomePage() {

    const navigate = useNavigate()

    const [auctions, setAuctions] = useState<Auction[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const fetchAuctions = () => {
        fetch(`${API_URL}/auctions/`)
            .then((res) => res.json())
            .then((data) => {
                setAuctions(data)
                setLoading(false)
            })
    }

    const fetchCurrentUser = () => {
        const token = localStorage.getItem("token")
        if (!token) return

        fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setCurrentUserId(data.id))
    }

    useEffect(() => {
        fetchAuctions()
        fetchCurrentUser()
    }, [])

    useEffect(() => {

        const sockets: WebSocket[] = []

        auctions.forEach((auction) => {

            const ws = new WebSocket(
                `${WS_URL}/ws/auctions/${auction.id}`
            )

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data)
                if (message.event === "NEW_BID") {
                    setAuctions((prev) =>
                        prev.map((a) =>
                            a.id === message.auction_id
                                ? { ...a, current_price: message.amount }
                                : a
                        )
                    )
                }
            }

            sockets.push(ws)
        })

        return () => sockets.forEach((s) => s.close())

    }, [auctions])

    const archiveAuction = async (auctionId: string) => {
        const token = localStorage.getItem("token")
        const response = await fetch(
            `${API_URL}/auctions/${auctionId}/archive`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            }
        )
        if (response.ok) fetchAuctions()
    }

    const cancelAuction = async (auctionId: string) => {
        const token = localStorage.getItem("token")
        const response = await fetch(
            `${API_URL}/auctions/${auctionId}/cancel`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            }
        )
        if (response.ok) fetchAuctions()
    }

    const statusColor = (status: string) => {
        if (status === "active") return "#109748"
        if (status === "closed") return "#c84444"
        if (status === "cancelled") return "#c84444"
        return "#8a5a20"
    }

    const iconButtonStyle = (color: string) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        border: `1px solid ${color}`,
        backgroundColor: "transparent",
        color: color,
        cursor: "pointer",
    })

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
                Loading auctions...
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
                    fontSize: "52px",
                    marginBottom: "40px",
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: "700",
                }}
            >
                Real-Time Auctions
            </h1>

            <div style={{ maxWidth: "900px", margin: "0 auto" }}>

                {auctions.length === 0 && (
                    <div style={{ textAlign: "center", marginTop: "100px", color: "#a47148" }}>
                        <h2 style={{ fontSize: "28px", marginBottom: "12px" }}>
                            No auctions yet
                        </h2>
                        <p>Create the first auction</p>
                    </div>
                )}

                {auctions.map((auction) => (

                    <div
                        key={auction.id}
                        style={{
                            border: "1px solid #d4b896",
                            borderRadius: "16px",
                            padding: "24px",
                            marginBottom: "20px",
                            backgroundColor: "#fdf6ec",
                            boxShadow: "0 2px 8px rgba(122,91,62,0.08)",
                            textAlign: "center" as const,
                            maxWidth: "600px",
                            margin: "0 auto 20px auto",
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

                        <p style={{ color: "#a47148", fontSize: "15px", marginBottom: "14px" }}>
                            {auction.description}
                        </p>

                        <div
                            style={{
                                fontSize: "26px",
                                fontWeight: "700",
                                marginBottom: "6px",
                                fontFamily: "'Playfair Display', Georgia, serif",
                            }}
                        >
                            ${auction.current_price}
                        </div>

                        <div
                            style={{
                                color: statusColor(auction.status),
                                fontSize: "12px",
                                marginBottom: "8px",
                                fontWeight: "700",
                                textTransform: "uppercase" as const,
                                letterSpacing: "1px",
                            }}
                        >
                            {auction.status}
                        </div>

                        <CountdownTimer
                            endTime={auction.end_time}
                            startTime={auction.start_time}
                            status={auction.status}
                        />

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "20px",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >

                            <button
                                onClick={() => navigate(`/auction/${auction.id}`)}
                                style={{
                                    padding: "9px 20px",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: "#7a5b3e",
                                    color: "#fff1d9",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                }}
                            >
                                {auction.status === "active"
                                    ? "Place Bid"
                                    : auction.status === "scheduled"
                                        ? "View Details"
                                        : "View Results"}
                            </button>

                            {currentUserId === auction.seller_id && (
                                <>
                                    {(auction.status === "scheduled" || auction.status === "active") && (
                                        <button
                                            onClick={() => navigate(`/auction/${auction.id}/edit`)}
                                            title="Edit"
                                            style={iconButtonStyle("#a47148")}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    )}

                                    {(auction.status === "scheduled" || auction.status === "active") && (
                                        <button
                                            onClick={() => cancelAuction(auction.id)}
                                            title="Cancel auction"
                                            style={iconButtonStyle("#a03030")}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}

                                    {(auction.status === "closed" || auction.status === "cancelled") && (
                                        <button
                                            onClick={() => archiveAuction(auction.id)}
                                            title="Archive"
                                            style={iconButtonStyle("#a47148")}
                                        >
                                            <Archive size={16} />
                                        </button>
                                    )}
                                </>
                            )}

                        </div>

                    </div>

                ))}

            </div>

        </div>
    )
}

export default HomePage