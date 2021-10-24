import styles from './styles/Landing.module.scss'
import Link from 'next/link';
import { useMoralis } from "react-moralis";
import Router from 'next/router'
import Moralis from 'moralis';
import { useState } from "react";
import StatusMessage from './StatusMessage';


export default function Landing() {
  const { isAuthenticated, authenticate, isAuthenticating, authError, logout, user } = useMoralis();

  const [loadingStatus, setLoadingStatus] = useState(false);
  const [errorStatus, setErrorStatus] = useState(false);
  const [status, setStatus] = useState({});

  const auth = async (el) => {
    setLoadingStatus(true);
    try {
      const res = await Moralis.authenticate({signingMessage: "CryptoViper quiere acceder a tu MetaMask para iniciar sesión"});
      if(!authError) {
        switch(el.target.textContent) {
          case 'PvE':
            Router.push('/pve');
            break;
            default:  
            Router.push('/account');
            break;
        }
      } 
    } catch(e) {
      setStatus({ message: 'Error al iniciar sesión: '+e.message, error: true});
      setErrorStatus(true);
      setTimeout(() => setErrorStatus(false), 5000);
    }
    setLoadingStatus(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img src="LandingText.svg" className={styles.title} alt="CryptoViper" />
          <h2 className={styles.pancakeswapText}>Consigue $CRYV en PancakeSwap <a href="https://pancake.kiemtienonline360.com/#/swap?outputCurrency=0xd1af9c4f9ba37d0c889353515898b479022355f5" target="_blank" rel="noopener noreferrer" className={styles.linkPS}>aqui!</a></h2>
        </div>
        <div className={styles.btns}>
          { isAuthenticated ? (
            <div className={styles.btnBox}>
              <Link href="/pve">
                <div className={styles.pveBtn}>
                  <span className={styles.pveText}>PvE</span>
                </div>
              </Link>
              <a href="/WhitePaper.pdf" target="_blank">
                <div className={styles.continueBtn}>
                  <span className={styles.continueText}>WhitePaper</span>
                </div>
              </a>
              <Link href="/pvp">
                <div className={styles.pvpBtn}>
                  <span className={styles.pvpText}>PvP</span>
                </div>
              </Link>
            </div>
          ) : (
            <div className={styles.btnBox}>
              <div className={styles.pveBtn} onClick={auth}>
                <span className={styles.pveText}>PvE</span>
              </div>
              <div className={styles.continueBtn}>
                <a href="/WhitePaper.pdf" target="_blank">
                  <span className={styles.continueText}>WhitePaper</span>
                </a>
              </div>
              <div className={styles.pvpBtn} onClick={auth}>
                <span className={styles.pvpText}>PvP</span>
              </div>
            </div>
          ) }
        </div>
      </div>
      <div className={styles.box}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      { loadingStatus && 
        <div className={styles.loadingStatus}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinWrapper}>
              <div className={styles.spinner}></div>
            </div>
          </div>
          <div className={styles.background}></div>
        </div>
      }

      <StatusMessage status={status} isOpen={errorStatus} setIsOpen={setErrorStatus} />
    </div>
  )

} 