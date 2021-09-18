import styles from './styles/Navbar.module.css'
import { Button } from "@chakra-ui/react"
import { useMoralis } from "react-moralis";
import SignUp from "./Signup";
import { useState } from "react";
import Login from "./Login";

const cryvTokenAddress = "0xd1aF9c4f9ba37D0c889353515898B479022355f5";

export default function Navbar() {
  const { isAuthenticated, isAuthenticating, authError, logout, user } = useMoralis();
  const [ signupPopup, setSignupPopup ] = useState(false);
  const [ loginPopup, setLoginPopup ] = useState(false);

  if (isAuthenticated && (signupPopup || loginPopup) ) {
    setSignupPopup(false);
    setLoginPopup(false);
  }

  return (
    <nav className={styles.nav}>
      <a href="#">CryptoViper</a>
      <div className={styles.links}>
        <a href="#">Inicio</a>
        <a href="#">WhitePaper</a>
        { isAuthenticated ? 
        <div>
          <p>{user.attributes.accounts}</p>
          <Button onClick={() => logout()} className={styles.loginMetaMask}>Desconectarse</Button> 
        </div> :
        <div className={styles.AuthenticationBtn}>
          <Button onClick={() => setLoginPopup(true)}>Iniciar Sesion</Button>
          <Button onClick={() => setSignupPopup(true)}>Registrarse</Button>
        </div>
        }
      </div>

      <SignUp trigger={signupPopup} setTrigger={setSignupPopup}/>
      <Login trigger={loginPopup} setTrigger={setLoginPopup}/>
    </nav>
  )

}