// Styles
import styles from '../styles/Home.module.css'
// Components
import Navbar from '../components/Navbar'
import Inicio from '../components/Inicio'

export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />
      <Inicio />
    </div>
  )
}