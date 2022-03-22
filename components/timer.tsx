import { useState } from "react";

function Timer ({ time }: any) {
    const [currentTime, setCurrentTime] = useState(time);

    return (
        <div className="timer">
            {currentTime}
        </div>
    )
}

export default Timer;