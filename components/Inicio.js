import styles from './styles/Inicio.module.css'


export default function Inicio() {

  return (
    <div className={styles.container}>
      <div className={styles.leftSec}>
        <h1>CryptoViper</h1>
        <h2>Consigue $CRYV en PancakeSwap <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">aqui!</a></h2>
        <div className={styles.buttons}>
          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className={styles.btn}>PvP</a>
          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className={styles.btn}>PvE</a>
        </div>
      </div>
      <div className={styles.rightSec}>
       <img src="/logoo.svg" alt="CryptoViper Logo" />
      </div>
    </div>
  )

}