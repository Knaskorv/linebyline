function Scoreboard({ players }: any) {
    return (
        <div className="scoreboard">
            {
                players.sort((a, b) => a.score > b.score ? -1 : 1).map(player => <div key={player.id}>
                    <div className="score-card">{player.name} got {player.score} points</div>
                </div>)
            }
        </div>
    )
}

export default Scoreboard;