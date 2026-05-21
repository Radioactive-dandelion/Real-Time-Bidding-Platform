import { useState } from "react"

function CreateAuctionForm() {

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [startingPrice, setStartingPrice] = useState("")
    const [reservePrice, setReservePrice] = useState("")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")

    const createAuction = async () => {

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
                    start_time: startTime,
                    end_time: endTime,
                }),
            }
        )

        if (!response.ok) {

            const error = await response.json()

            alert(error.detail)

            return
        }

        alert("Auction created!")

        window.location.reload()
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
                    style={{
                        padding: "14px",
                        borderRadius: "10px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: "#2563eb",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "16px",
                        marginTop: "10px",
                    }}
                >
                    Create Auction
                </button>

            </div>

        </div>
    )
}

export default CreateAuctionForm