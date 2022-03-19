
function PlayerList({ players=[] }: any) {
    return (
        <div className="player-container">
            {
                players.map(player => 
                <div className="player" key={player.id}>
                    
                    <div className="player-name">{player.name}</div>
                    <div className="player-status"> { player.isDrawing ? 'Is drawing' : (player.guessedCorrect ? 'Guessed correct!' : 'Is guessing...') } </div>
                    <div className="player-score">{player.score} points</div>
                </div>)
            }
        </div>
    )
}

export default PlayerList;