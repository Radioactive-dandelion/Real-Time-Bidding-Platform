import { Routes, Route } from "react-router-dom"

import HomePage from "./pages/HomePage"
import AuctionDetailPage from "./pages/AuctionDetailPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import TwoFactorSetupPage from "./pages/TwoFactorSetupPage"
import CreateAuctionPage from "./pages/CreateAuctionPage"
import EditAuctionPage from "./pages/EditAuctionPage"

import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import HistoryPage from "./pages/HistoryPage"
import BidHistoryPage from "./pages/BidHistoryPage"

function App() {

    return (
        <>

            <Navbar />

            <Routes>

                <Route
                    path="/"
                    element={<HomePage />}
                />

                <Route
                    path="/auction/:id"
                    element={
                        <ProtectedRoute>
                            <AuctionDetailPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route
                    path="/settings/2fa"
                    element={
                        <ProtectedRoute>
                            <TwoFactorSetupPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/create-auction"
                    element={
                        <ProtectedRoute>
                            <CreateAuctionPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/auction/:id/edit"
                    element={
                        <ProtectedRoute>
                            <EditAuctionPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <HistoryPage />
                        </ProtectedRoute>
                    }
                />

                <Route
    path="/auction/:id/bids"
    element={<BidHistoryPage />}
/>

            </Routes>

        </>
    )
}

export default App