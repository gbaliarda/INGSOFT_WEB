import styles from './styles/Landing.module.scss'
import Link from 'next/link';

export default function Landing() {

  return (
    <div className={styles.container}>
      <div className={styles.leftSec}>
        <h1>CryptoViper</h1>
        <h2>Consigue $CRYV en PancakeSwap <a href="#" target="_blank" rel="noopener noreferrer">aqui!</a></h2>
        <div className={styles.buttons}>
          <a href="#" className={styles.btn}>PvP</a>
          <Link href="/pve">
            <a href="#" className={styles.btn}>PvE</a>
          </Link>
        </div>
      </div>
      <div className={styles.rightSec}>
       <img src="/logoo.svg" alt="CryptoViper Logo" />
      </div>
    </div>
  )

} 