import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

type Props = {
    endTime: string
    startTime?: string
    status?: string
}

function CountdownTimer({ endTime, startTime, status }: Props) {

    const calculateTimeLeft = () => {

        const now = new Date().getTime()

        if (status === "scheduled" && startTime) {
            const diff = new Date(startTime).getTime() - now

            if (diff <= 0) return { label: "Starting soon", time: "" }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
            const minutes = Math.floor((diff / (1000 * 60)) % 60)
            const seconds = Math.floor((diff / 1000) % 60)

            const time = days > 0
                ? `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                : `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

            return { label: "Starts in", time }
        }

        const diff = new Date(endTime).getTime() - now

        if (diff <= 0) return { label: "Auction ended", time: "" }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((diff / (1000 * 60)) % 60)
        const seconds = Math.floor((diff / 1000) % 60)

        const time = days > 0
            ? `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            : `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

        return { label: "Ends in", time }
    }

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)
        return () => clearInterval(timer)
    }, [endTime, startTime, status])

    return (
        <div
            style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    color: timeLeft.time ? "#d27427" : "#c84444",
    marginTop: "10px",
    justifyContent: "center",
}}
        >
            <Clock size={14} />
            <span>
                {timeLeft.time
                    ? `${timeLeft.label}: ${timeLeft.time}`
                    : timeLeft.label}
            </span>
        </div>
    )
}

export default CountdownTimer