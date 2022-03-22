import type { NextPage } from 'next'
import { useRouter } from 'next/router'

const Home: NextPage = () => {
  const router = useRouter()

  async function startGame() {
    try {     
      const response = await fetch(`${process.env.BE_URL || 'https://warm-river-49161.herokuapp.com'}/api/create`);
      const roomId = await response.text();
      router.push(`/${roomId}`)
    } catch(err) {
      console.error(`Error: ${err}`);
    }

  }

  return (
    <div className="home">
      <img src='/lineByLine.png'></img>
      <button
        onClick={startGame}
      >Create a new lobby</button>
    </div>
  )
}

export default Home
