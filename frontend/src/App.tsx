import {
    Routes,
    Route,
} from "react-router-dom"

import HomePage from "./pages/HomePage"
import AuctionDetailPage from "./pages/AuctionDetailPage"

function App() {

    return (

        <Routes>

            <Route
                path="/"
                element={<HomePage />}
            />

            <Route
                path="/auction/:id"
                element={<AuctionDetailPage />}
            />

        </Routes>

    )
}

export default App