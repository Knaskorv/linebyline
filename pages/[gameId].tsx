import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Canvas from '../components/canvas'
import { io } from "socket.io-client";
import PlayerList from '../components/playerList';
import { json } from 'stream/consumers';

const roundLines = 3;
const maxLines = 10;

let socket: any;

enum GameState {
    idle = 'idle',
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
    const [isDrawing, setIsDrawing] = useState({});
    const [playerId, setPlayerId] = useState();
    const [isAdmin, setIsAdmin] = useState(false);
    const [options, setOptions] = useState([]);
    const [status, setStatus] = useState('Setting up');

    useEffect(() => {
        socket = io('https://warm-river-49161.herokuapp.com/');
        socket.on("connect", () => {
            setPlayerId(socket.id)
            console.log('Connected', socket.id)
        });
        socket.on("game-update", setGame);

        socket.on("choose", setOptions);
        return () => { socket.close() }
    }, [])

    useEffect(() => {
        if (router.isReady) {
            socket.emit('connected', gameId)
        }
    }, [router])

    useEffect(() => {
        if (!game) return router.push('/');
        console.log('Game-update', game)
        setGame(game)
        const { state, players } = game;

        setPlayer(players?.find(player => player.id === playerId));

        if (state === 'guess') {
            setDisabled(true);
        }

        switch(state) {
            case GameState.idle: setStatus('Waiting for players'); break;
            case GameState.choose: setStatus('Player is choosing what to draw'); break;
            case GameState.drawing: setStatus('Player is drawing'); break;
            case GameState.guessing: setStatus('Players are guessing'); break;
            case GameState.end: setStatus('Game over'); break;
        }

        setDisabled(state !== GameState.drawing)

        setIsDrawing(game.players && game.players[game.playerDrawing]?.id === playerId)
        setIsAdmin(game.admin === playerId);
    }, [game])

    function onLineAdded(line: any) {
        console.log('Line added', line)
        setGame({ ...game, lines: [...game.lines, line] })
        socket.emit('draw-line', line)
    }

    function handleGuessKeyDown(event: any) {
        if (event.key === 'Enter') {
            console.log(event.target.value)
            socket.emit('guess', event.target.value)
            event.target.value = '';
        }
    }

    function chooseTarget(target) {
        socket.emit('choose-target', target)
        setOptions([]);
    }

    return !game ? 'Loading' : (
        <div className='game-container'>
            {/* Game id: {gameId} */}
            {/* <div>player Id { playerId }</div>
         <div>player { JSON.stringify(player) }</div>
         <div>Lines { game?.lines?.length }/{roundLines}</div> */}
            {/* <div>Round{game?.round}/{game?.settings?.maxRounds}</div> */}
            {/* <div>State { game.state } </div>
         <div>admin { game.admin } </div>
         <div>admin { isAdmin ? 'yes' : 'no' } </div>
         <div>Drawing { game.playerDrawing } </div>
         <div>Drawing { isDrawing ? 'yes' : 'no' } </div>
          */}
            {
                game.state === GameState.idle ?
                    <div>
                        {isAdmin ? <button onClick={() => socket.emit('start-game')}>Start</button> : <span>Waiting for host to start</span>}
                    </div>
                    : ''
            }

            <div className='game-header'>
                <div className='game-round'>Round {game?.round}/{game?.settings?.maxRounds}</div>
                <div className='game-status'>{ status }</div>
            </div>

            <PlayerList
                players={game.players}
            ></PlayerList>

            <Canvas
                disabled={disabled || !isDrawing}
                onLineAdded={onLineAdded}
                lines={game.lines}
                showPaintTools={isDrawing}
            ></Canvas>

            {
                isDrawing ? '' :
                    <div>
                        <input
                            placeholder='Guess'
                            onKeyDown={handleGuessKeyDown}
                            disabled={player?.roundOver || !player?.isGuessing || isDrawing || game?.state !== GameState.guessing}></input>
                    </div>
            }

            { !options.length ? '' : <div className='options'>
                <div>Select what to draw</div>
                <div className='options-container'>
            {

                options.map(option => <button
                    key={option}
                    onClick={() => chooseTarget(option)}
                > {option}

                </button>)
            }
            </div>
            </div>
            }
        </div>
    )
}

export default Game