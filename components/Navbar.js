import styles from './styles/Navbar.module.css'

export default function Navbar() {

  return (
    <nav className={styles.nav}>
      <a href="#">CryptoViper</a>
      <div className={styles.links}>
        <a href="#">Inicio</a>
        <a href="#">WhitePaper</a>
        <a href="#" className={styles.loginMetaMask}>Entrar con MetaMask</a>
      </div>
    </nav>
  )

}