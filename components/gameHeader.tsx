import { useEffect, useState } from "react";

function GameHeader ({ socket }: any) {

    const [cta, setCta] = useState(null);
    const [timer, setTimer] = useState();
    const [gameInfo, setGameInfo] = useState(null);
    const [settings, setSettings] = useState(null);
    const [state, setState] = useState(null);
    const [lines, setLines] = useState(null);

    useEffect(() => {
        socket?.on('timer', setTimer);
        socket?.on('game-info', setGameInfo);
        socket?.on('settings', setSettings);
        socket?.on('state', setState);
        socket?.on('lines', setLines);
    }, [socket])

    useEffect(() => {
        setCta(timer || state);
    })

    return (
        <div className='game-header'>
            <div>
                <div className='game-round'>Round {gameInfo?.round}/{settings?.maxRounds}</div>
                <div className='lines-round'> { settings?.maxLineRounds *  settings?.linesRound - lines?.length} Lines left </div>
            </div>

            <div className="timer"> { cta } </div>

            <div>
                <div className='game-status'>{ state }</div>
                { !gameInfo?.currentCategory ? '' : <div className='game-category'>{ gameInfo.currentCategory }: <span className='helper-text'>{ gameInfo.helperText }</span> </div> }
            </div>
        </div>
    )
}

export default GameHeader;