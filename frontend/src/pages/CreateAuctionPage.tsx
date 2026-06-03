import { useNavigate } from "react-router-dom"
import CreateAuctionForm from "../components/CreateAuctionForm"

function CreateAuctionPage() {

    const navigate = useNavigate()

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
                    fontSize: "40px",
                    marginBottom: "40px",
                    fontFamily: "'Playfair Display', Georgia, serif",
                }}
            >
                Create Auction
            </h1>

            <CreateAuctionForm
                onAuctionCreated={() => navigate("/")}
            />

        </div>
    )
}

export default CreateAuctionPage