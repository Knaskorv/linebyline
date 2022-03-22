import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Canvas from '../components/canvas'
import { io } from "socket.io-client";
import PlayerList from '../components/playerList';
import Scoreboard from '../components/scoreboard';
import NameInput from '../components/enterName';
import OptionSelect from '../components/options';
import GameHeader from '../components/gameHeader';
import Test from '../components/test';

let socket: any;

enum GameState {
    idle = 'idle',
    ready = 'ready',
    choose = 'choose',
    drawing = 'draw',
    guessing = 'guess',
    end = 'end',
}

function Room() {
    const router = useRouter()
    const { gameId } = router.query

    useEffect(() => {
        socket = io(process.env.BE_URL || 'http://localhost:3000');
        socket.on("connect", () => {  console.log('Connected') });
        socket.on("broad", (data) => {  console.log('logs', data) });

        return () => { socket.close() }
    }, [])

    useEffect(() => {
        if (router.isReady) {
            socket.emit('connect-test', gameId, (roomData) => {
                // if (!roomData) return router.push('/');
                console.log(roomData);
            })
        }
    }, [router])
   
    function testButton () {
        socket.emit('chat-test', socket.id)
    }
    
    function countButton () {
        socket.emit('countButton')
    }

    return (
        <div>
            Hej
            <button
                onClick={testButton}
            > Send some data</button>
            <button
                onClick={countButton}
            > count</button>

            <Test socket={socket}></Test>
        </div>
    )

}

export default Room