import { useState } from "react"

type Props = {
    onAuctionCreated?: () => void
}

function CreateAuctionForm({ onAuctionCreated }: Props) {

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [startingPrice, setStartingPrice] = useState("")
    const [reservePrice, setReservePrice] = useState("")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")

    const [loading, setLoading] = useState(false)

    const [errorMessage, setErrorMessage] = useState("")

    const createAuction = async () => {

        setErrorMessage("")

        setLoading(true)

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/auctions/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        starting_price: Number(startingPrice),
                        reserve_price: Number(reservePrice),

                        start_time: new Date(startTime).toISOString(),
                        end_time: new Date(endTime).toISOString(),
                    }),
                }
            )

            if (!response.ok) {

                const error = await response.json()

                setErrorMessage(
                    JSON.stringify(error.detail, null, 2)
                )

                setLoading(false)

                return
            }

            setTitle("")
            setDescription("")
            setStartingPrice("")
            setReservePrice("")
            setStartTime("")
            setEndTime("")

            if (onAuctionCreated) {
                onAuctionCreated()
            }

        } catch (error) {

            setErrorMessage("Failed to create auction")
        }

        setLoading(false)
    }

    const inputStyle = {
        width: "100%",
        padding: "14px",
        borderRadius: "10px",
        border: "1px solid #334155",
        backgroundColor: "#1e293b",
        color: "white",
        fontSize: "16px",
        boxSizing: "border-box" as const,
    }

    return (
        <div
            style={{
                border: "1px solid #334155",
                borderRadius: "20px",
                padding: "40px",
                marginBottom: "50px",
                backgroundColor: "#0f172a",
                maxWidth: "900px",
                margin: "0 auto 50px auto",
            }}
        >

            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "30px",
                    fontSize: "36px",
                }}
            >
                Create Auction
            </h2>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                }}
            >

                <input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={inputStyle}
                />

                <input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={inputStyle}
                />

                <input
                    type="number"
                    placeholder="Starting Price"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    style={inputStyle}
                />

                <input
                    type="number"
                    placeholder="Reserve Price"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                    style={inputStyle}
                />

                <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={inputStyle}
                />

                <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={inputStyle}
                />

                <button
                    onClick={createAuction}
                    disabled={loading}
                    style={{
                        padding: "14px",
                        borderRadius: "10px",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                        backgroundColor: loading
                            ? "#475569"
                            : "#2563eb",

                        color: "white",
                        fontWeight: "bold",
                        fontSize: "16px",
                        marginTop: "10px",
                    }}
                >
                    {loading
                        ? "Creating..."
                        : "Create Auction"}
                </button>

                {errorMessage && (

                    <div
                        style={{
                            marginTop: "20px",
                            color: "#f87171",
                            backgroundColor: "#450a0a",
                            padding: "16px",
                            borderRadius: "10px",
                            whiteSpace: "pre-wrap",
                            fontSize: "14px",
                        }}
                    >
                        {errorMessage}
                    </div>
                )}

            </div>

        </div>
    )
}

export default CreateAuctionForm