import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const router = useRouter()

  async function startGame() {
    console.log('Start game')
    try {     
      const response = await fetch('https://warm-river-49161.herokuapp.com/');
      const roomId = await response.text();
      console.log('Completed!', roomId);
      router.push(`/${roomId}`, undefined, { shallow: true })
    } catch(err) {
      console.error(`Error: ${err}`);
    }

  }

  return (
    <div className="home">
      <button
        onClick={startGame}
      >Start game</button>
    </div>
  )
}

export default Home
