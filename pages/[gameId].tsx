import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Canvas from '../components/canvas'
import { io } from "socket.io-client";
import PlayerList from '../components/playerList';
import Scoreboard from '../components/scoreboard';
import NameInput from '../components/enterName';
import OptionSelect from '../components/optionSelect';
import GameHeader from '../components/gameHeader';

//"include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],

let socket: any;

enum GameState {
    init = 'INIT',
    ready = 'READY',
    target = 'TARGET',
    draw = 'DRAW',
    guess = 'GUESS',
    end = 'END'
}

function Room() {
    const router = useRouter()
    const { gameId } = router.query

    const [gameInfo, setGameInfo] = useState(null);
    const [players, setPlayers] = useState([]);
    const [state, setState] = useState('INIT');
    
    const [player, setPlayer] = useState(null);
    const [settings, setSettings] = useState(null);
    const [playerId, setPlayerId] = useState(null);

    useEffect(() => {
        socket = io(process.env.BE_URL || 'https://warm-river-49161.herokuapp.com/');
        socket.on("connect", () => {  setPlayerId(socket.id)  });
        
        socket.on("players", setPlayers);
        socket.on("game-info", setGameInfo);
        socket.on("state", setState);
    
        return () => { socket.close() }
    }, [])

    useEffect(() => {
        if (router.isReady) {
            socket.emit('connected', gameId, (roomData) => {
                if (!roomData) return router.push('/');
                handleRoomData(roomData);
            })
        }
    }, [router])
   
    useEffect(() => {
        setPlayer(players.find(player => player.id === playerId))
    }, [players])

    function handleRoomData(roomData) {
        console.log('Got game data', roomData)
        const { players, lines, state, round, currentCategory, helperText, timeRemaining, settings } = roomData;
        
        setGameInfo({ lines, state, round, currentCategory, helperText, timeRemaining });
        
        
        setPlayers(players);
        setSettings(settings);
    }

    function handleNameKeyDown(event: any) {
        if (event.key === 'Enter') {
            socket.emit('join', event.target.value)
            event.target.value = '';
        }
    }

    function handleGuessKeyDown(event: any) {
        if (event.key === 'Enter') {
            socket.emit('guess', event.target.value)
            event.target.value = '';
        }
    }

    return !settings ? 'Connecting...' : (
    <>
    <div className='game-container'>
        <GameHeader socket={ socket }></GameHeader>

        <div className='game'>
            <PlayerList players={players}></PlayerList>
            <Canvas socket={ socket } disabled={ state !== GameState.draw || !player?.isDrawing } ></Canvas>
        </div>
        
        {
            state !== 'GUESS' || player?.isDrawing || player?.hasGuessed || player?.guessedCorrect ? '' :
                <div>
                    <input
                        autoFocus
                        placeholder='Guess'
                        onKeyDown={handleGuessKeyDown}
                        ></input>
                </div>
        }

        {state === GameState.ready && player?.isAdmin ? <button onClick={() => socket.emit('start-game')}>Start</button> : ''}
    </div>
        { !player ? <NameInput handleNameKeyDown={handleNameKeyDown}></NameInput> : ''}
        <OptionSelect socket={ socket }></OptionSelect>
    </>
    )

}

export default Room