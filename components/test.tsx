import { useEffect, useState } from "react";

function Test ({ socket }: any) {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        socket?.on('timer', updateTimer)
    }, [])

    function updateTimer() {
        console.log('Current count', count)
        setCount(count + 1)
    }

    return (
        <div className="timer">
            Test: {count}
            <button onClick={updateTimer}>
                Click me
            </button>
        </div>
    )
}

export default Test;