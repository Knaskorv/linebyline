import { useEffect, useState } from "react";

enum GameState {
    init = 'INIT',
    ready = 'READY',
    target = 'TARGET',
    draw = 'DRAW',
    guess = 'GUESS',
    end = 'END'
}

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
        switch(state) {
            case GameState.init:
                setCta('Waiting for players');
                break; 
            case GameState.ready:
                setCta('Ready to start');
                break; 
            case GameState.target:
                setCta('Choosing what to draw');
                break; 
            case GameState.draw:
                setCta(`Drawing${timer ? ` (${timer})` : ''}`);
                break; 
            case GameState.guess:
                setCta(`Guessing${timer ? ` (${timer})` : ''}`);
                break; 
            case GameState.end:
                setCta('Game over');
                break; 
        }
    })

    return (
        <div className='game-header'>
            <div>
                <div className='game-round'>Round {gameInfo?.round}/{settings?.maxRounds}</div>
                <div className='lines-round'> { settings?.maxLineRounds *  settings?.linesRound - lines?.length} Lines left </div>
            </div>

            <div className="timer"> { cta } </div>

            <div>
                <div className='game-status'>{ gameInfo?.currentCategory }</div>
                <div className='game-category'><span className='helper-text'>{ gameInfo?.helperText }</span> </div>
            </div>
        </div>
    )
}

export default GameHeader;