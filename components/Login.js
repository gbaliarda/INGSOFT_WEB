import styles from './styles/Login.module.css'
import { useState } from 'react';
import { useMoralis } from "react-moralis";
import { Button, Box, Input, Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton } from "@chakra-ui/react"

function Login(props) {
  const { authenticate, isAuthenticating, authError } = useMoralis();
  const {login} = useMoralis()
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()

  return (props.trigger) ? (
    <div className={styles.popup}>
      <div className={styles.popupInner}>
          { authError &&
          <Alert status="error">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Error iniciando sesion!</AlertTitle>
              <AlertDescription display="block">
                {authError.message}
              </AlertDescription>
            </Box>
          </Alert>
          }
          <Button className={styles.cerrarBtn} onClick={() => props.setTrigger(false)}>Cerrar</Button>
          {props.children}
        <div className={styles.form}>
          <Box>
            <Input placeholder="Email" value={email} onChange={(event) => setEmail(event.currentTarget.value)}></Input>
            <Input placeholder="Contraseña"  type="password" value={password} onChange={(event) => setPassword(event.currentTarget.value)}></Input>
            <Button onClick={() => login(email, password)}>Iniciar sesion</Button>
            <Button isLoading={isAuthenticating} onClick={() => authenticate()} className={styles.loginMetaMask}>Entrar con MetaMask</Button>
          </Box>
        </div>
      </div>
    </div>
   ) : "";
}

export default Login  
