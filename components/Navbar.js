import styles from './styles/Navbar.module.scss'
import { useMoralis } from "react-moralis";
import Link from 'next/link';

const cryvTokenAddress = "0xd1aF9c4f9ba37D0c889353515898B479022355f5";

export default function Navbar() {
  const { isAuthenticated, authenticate, isAuthenticating, authError, logout, user } = useMoralis();

  return (
    <nav className={styles.nav}>
      <a href="#">CryptoViper</a>
      <div className={styles.links}>
        <Link href="/">Inicio</Link>
        <Link href="/">WhitePaper</Link>
        { isAuthenticated && 
          <span>{`${user.attributes.accounts[0].substring(0,5)}...${user.attributes.accounts[0].slice(-4)}`}</span> 
        }
        { isAuthenticated && <button onClick={logout} >Desconectarse</button> }
        { !isAuthenticated && <button onClick={authenticate}>Iniciar Sesión</button>}
      </div>
    </nav>
  )

}