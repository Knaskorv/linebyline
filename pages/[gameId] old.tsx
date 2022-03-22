import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Canvas from '../components/canvas'
import { io } from "socket.io-client";
import PlayerList from '../components/playerList';
import Scoreboard from '../components/scoreboard';

let socket: any;

enum GameState {
    idle = 'idle',
    ready = 'ready',
    choose = 'choose',
    drawing = 'draw',
    guessing = 'guess',
    end = 'end',
}

function Game() {
    const router = useRouter()
    const { gameId } = router.query

    const [player, setPlayer] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [game, setGame] = useState({});
    const [playerId, setPlayerId] = useState();
    const [isAdmin, setIsAdmin] = useState(false);
    const [options, setOptions] = useState([]);
    const [status, setStatus] = useState('Setting up');
    const [canGuess, setCanGuess] = useState(false);

    useEffect(() => {
        socket = io(process.env.BE_URL || 'http://localhost:3000');
        socket.on("connect", () => {
            setPlayerId(socket.id)
        });
        socket.on("game-update", setGame);

        socket.on("choose", setOptions);
        socket.on("test", (a) => console.log('TEST!!! ', a));
        return () => { socket.close() }
    }, [])

    useEffect(() => {
        if (router.isReady) {
            socket.emit('connected', gameId)
        }
    }, [router])

    useEffect(() => {
        if (!game) return router.push('/');
        

        const { state, players } = game;
        setPlayer(players?.find(player => player.id === playerId));

        if (state === 'guess') {
            setDisabled(true);
        }

        switch(state) {
            case GameState.idle: setStatus('Waiting for players'); break;
            case GameState.ready: setStatus('Ready to start'); break;
            case GameState.choose: setStatus('Player is choosing what to draw'); break;
            case GameState.drawing: setStatus('Player is drawing'); break;
            case GameState.guessing: setStatus('Players are guessing'); break;
            case GameState.end: setStatus('Game over'); break;
        }

        setDisabled(state !== GameState.drawing)
        setIsAdmin(game.admin === playerId);
    }, [game])

    useEffect(() => {
        setCanGuess(
            player && !player?.guessedCorrect && !player?.hasGuessed && !player?.isDrawing && game?.state === GameState.guessing
        )
    }, [player])

    function onLineAdded(line: any) {
        setGame({ ...game, lines: [...game.lines, line] })
        socket.emit('draw-line', line)
    }

    function handleGuessKeyDown(event: any) {
        if (event.key === 'Enter') {
            socket.emit('guess', event.target.value)
            event.target.value = '';
        }
    }
    
    function handleNameKeyDown(event: any) {
        if (event.key === 'Enter') {
            socket.emit('join', event.target.value)
            event.target.value = '';
        }
    }

    function chooseTarget(target) {
        socket.emit('choose-target', target)
        setOptions([]);
    }

    return !game ? 'Loading' : (
        <div className='game-container'>
            
            
            <div className='game-header'>
                <div>
                    <div className='game-round'>Round {game?.round}/{game?.settings?.maxRounds}</div>
                    <div className='lines-round'> { game?.settings?.maxLineRounds *  game?.settings?.linesRound - game?.lines?.length} Lines left </div>
                </div>
                {
                game.state === GameState.ready && isAdmin ? <button onClick={() => socket.emit('start-game')}>Start</button> : ''
                }

                <div>
                    <div className='game-status'>{ status }</div>
                    { !game.currentCategory ? '' : <div className='game-category'>{ game.currentCategory }: <span className='helper-text'>{ game.helperText }</span> </div> }
                </div>
            </div>


            <div className='game'>
                <PlayerList
                    players={game.players}
                ></PlayerList>

                <Canvas
                    disabled={disabled || !player?.isDrawing}
                    onLineAdded={onLineAdded}
                    lines={game.lines}
                    showPaintTools={player?.isDrawing}
                ></Canvas>
            </div>
            
            {
                !canGuess ? '' :
                    <div>
                        <input
                            autoFocus
                            placeholder='Guess'
                            onKeyDown={handleGuessKeyDown}
                            ></input>
                    </div>
            }

            { !options.length ? '' : <div className='options'>
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
            }

            {
                player ? '' : <div className='player-name-input'>
                    <div>Enter your name</div>
                    <input
                        onKeyDown={handleNameKeyDown}
                        maxLength={15}
                        />
                </div>
            }

            {
                game.state !== GameState.end ? '' : <Scoreboard players={ game.players }></Scoreboard>
            }

        </div>
    )
}

export default Game