import styles from './styles/Navbar.module.scss'
import { useMoralis } from "react-moralis";
import Link from 'next/link';
import Moralis from 'moralis';

const cryvTokenAddress = "0xd1aF9c4f9ba37D0c889353515898B479022355f5";

export default function Navbar() {
  const { isAuthenticated, authenticate, isAuthenticating, authError, logout, user } = useMoralis();

  return (
    <nav className={styles.nav}>
      <Link href="/">CryptoViper</Link>
      <div className={styles.links}>
        <Link href="/">Inicio</Link>
        <Link href="/">WhitePaper</Link>
        <Link href="/pve">PvE</Link>
        { isAuthenticated && 
          <div className={styles.userInfo}>
            <div className={styles.energyBox}>
              <span className={styles.energyText}>{`${user.attributes.energy}`}/20</span>
              <img src="energyIcon.svg" alt="energyIcon" className={styles.energyIcon}/>
            </div>
            <span className={styles.address}>{`${user.attributes.ethAddress.substring(0,5)}...${user.attributes.ethAddress.slice(-4)}`}</span> 
          </div>
        }
        { isAuthenticated && <button onClick={logout} >Desconectarse</button> }
        { !isAuthenticated && <button onClick={authenticate}>Iniciar Sesión</button>}
      </div>
    </nav>
  )

}