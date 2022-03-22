import { useEffect, useState } from "react";

function OptionSelect ({ socket }: any) {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        socket?.on("choose", setOptions);
    }, [socket])

    function chooseTarget(target) {
        socket.emit('choose-target', target)
        setOptions([]);
    }

    if (!options.length) return <></>;
    return (
        <div className='options'>
            <div>Select what to draw</div>
            <div className='options-container'>
        {
            options.map(option => <button
                key={`${option.category}-${option.target}`}
                onClick={() => chooseTarget(option)}
            > 
                <div>
                    <div className='option-category'>{option.category}</div>
                    <div className='option-target'>{option.target}</div>
                </div>
            </button>)
        }
            </div>
        </div>

    )
}

export default OptionSelect;