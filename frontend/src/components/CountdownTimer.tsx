import { useEffect, useState } from "react"

type Props = {
    endTime: string
}

function CountdownTimer({ endTime }: Props) {

    const calculateTimeLeft = () => {

        const difference =
            new Date(endTime).getTime() - new Date().getTime()

        if (difference <= 0) {

            return "Auction ended"
        }

        const hours = Math.floor(
            (difference / (1000 * 60 * 60)) % 24
        )

        const minutes = Math.floor(
            (difference / (1000 * 60)) % 60
        )

        const seconds = Math.floor(
            (difference / 1000) % 60
        )

        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
    }

    const [timeLeft, setTimeLeft] = useState(
        calculateTimeLeft()
    )

    useEffect(() => {

        const timer = setInterval(() => {

            setTimeLeft(calculateTimeLeft())

        }, 1000)

        return () => clearInterval(timer)

    }, [endTime])

    return (
        <div
            style={{
                fontSize: "22px",
                fontWeight: "bold",
                color: "#facc15",
                marginTop: "15px",
            }}
        >
            ⏳ Ends in: {timeLeft}
        </div>
    )
}

export default CountdownTimer