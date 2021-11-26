import styles from './styles/Account.module.scss'
import { useMoralis } from "react-moralis";
import Moralis from 'moralis';
import React, { useState, useEffect } from "react";
import Spinner from './Spinner';
import StatusMessage from './StatusMessage';

const cryvTokenAddress = "0xd1af9c4f9ba37d0c889353515898b479022355f5";

export default function Account() {
  const [exchangePopup, setExchangePopup] = useState(false);
  const [cryvBalance, setCryvBalance] = useState(0);
  const [ceBalance, setCeBalance] = useState(0);
  const [bnbBalance, setBnbBalance] = useState(0);
  const [loadingSpinner, setLoadingSpinner ] = useState(false);
  const [status, setStatus] = useState({});
  const [statusIsOpen, setStatusIsOpen] = useState(false);
  const [currentContainer, setCurrentContainer] = useState('');
  const [accountIsMounted, setAccountIsMounted] = useState(true);

  const { isAuthenticated, user, authenticate } = useMoralis();

  const toggleExchangePopup = () => {
    setExchangePopup(!exchangePopup);
  }

  async function getCryptoViperToken() {
    if(!isAuthenticated)
      return;

    const cryvQuery = new Moralis.Query("BscTokenBalance");
    cryvQuery.equalTo("token_address",cryvTokenAddress);
    cryvQuery.equalTo("address", user.attributes.ethAddress);
    const cryvResult = await cryvQuery.first();
  
    if(cryvResult == undefined)
      return;

    const results = cryvResult.attributes;
  
    if(accountIsMounted)
      setCryvBalance(results.balance/(10**18));
  
  }

  function getCeToken() {
    if(!isAuthenticated)
      return;
    
      setCeBalance(user.attributes.ceAmount);
  }

  async function getBnbToken() {
    if(!isAuthenticated)
      return;

    const bnbQuery = new Moralis.Query("BscBalance");
    bnbQuery.equalTo("address", user.attributes.ethAddress);
    const bnbResult = await bnbQuery.first();
  
    if(bnbResult == undefined)
      return;

    const results = bnbResult.attributes;
  
    if(accountIsMounted)
      setBnbBalance((results.balance/(10**18)).toFixed(3));
  
  }

  function changeCRYV(input) {
    if(input == undefined)
      return;

    if(input.target.value > ceBalance)
      input.target.value = ceBalance;
    document.querySelector('#exchangeInputCRYV').value = input.target.value/100;
  }

  function changeCE(input) {
    if(input.target.value > cryvBalance)
      input.target.value = cryvBalance;
    document.querySelector('#exchangeInputCE').value = input.target.value*100;
  }

  function setMaxCE() {
    document.querySelector('#exchangeInputCE').value = ceBalance;
    document.querySelector('#exchangeInputCRYV').value = ceBalance/100;
  }

  async function confirmExchange() {
    setLoadingSpinner(true);
    const ceToExchange = document.getElementById("exchangeInputCE").value;
    const cryvToExchange = document.getElementById("exchangeInputCRYV").value;
    const data = {
      recipient: user.attributes.ethAddress,
      ceBalance: ceToExchange,
      cryvWanted: cryvToExchange,
    }
    try {
      const result = await fetch("http://localhost:8080/claim", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data)
      });
      const d = await result.json();
      console.log(d);
      if(result.status != 200)
        throw new Error(d.message);
      user.set("ceAmount", parseInt(user.attributes.ceAmount-ceToExchange));
      if(user == null)
        return;
      await user.save();
      if(!accountIsMounted)
        return;
      setStatus({ message: `${ceToExchange}CE intercambiados con exito por ${cryvToExchange}CRYV`, error: false})
      toggleExchangePopup();
    } catch (e) {
      console.log(e);
      if(!accountIsMounted)
        return;
      setStatus({ message: 'Error al intercambiar CE por CRYV: '+e.message, error: true});
    }
    if(!accountIsMounted)
      return;
    setStatusIsOpen(true);
    setTimeout(() => setStatusIsOpen(false),5000);
    setLoadingSpinner(false);
  }

  useEffect(() => {
    if(!isAuthenticated)
      return;
    setAccountIsMounted(true);
    getCryptoViperToken();
    getCeToken();
    getBnbToken();

    accountIsMounted && setCurrentContainer(document.getElementsByClassName(styles.navActive)[0].textContent);

    return () => {
      setAccountIsMounted(false);
    }
  }, [isAuthenticated]);

  const addActive = (el) => {
    var list = document.getElementsByClassName(styles.navActive);
    list[0].classList.remove(styles.navActive);
    el.target.classList.add(styles.navActive);
    setCurrentContainer(el.target.textContent);
  }

  return (
    <div className={styles.container}>
      { isAuthenticated ? (
      <div>
        <h2 className={styles.title}>Mi cuenta</h2>
        <div className={styles.accountHeader}>
          <div className={styles.balance}>
            <div className={styles.showCryv}>
              <img src="tokenprincipal.svg" alt="CryptoViper token" className={styles.cryvLogo}/>
              <div className={styles.cryvDetails}>
                <a href="https://testnet.bscscan.com/token/0xd1af9c4f9ba37d0c889353515898b479022355f5" target="_blank" rel="noreferrer">
                  <h3 className={styles.cryvTitle}>CRYV</h3>
                </a>
                <h3 className={styles.cryvAmount}>{`${cryvBalance}`}</h3>
              </div>
            </div>
            <div className={styles.showCe}>
              <img src="tokeningame.svg" alt="Crimson Elixir token" className={styles.ceLogo}/>
              <div className={styles.ceDetails}>
                <h3 className={styles.ceTitle}>CE</h3>
                <h3 className={styles.ceAmount}>{`${ceBalance}`}</h3>
              </div>
            </div>
            <div className={styles.showBnb}>
              <img src="bnb.svg" alt="Binance token" className={styles.bnbLogo}/>
              <div className={styles.bnbDetails}>
                <h3 className={styles.bnbTitle}>BNB</h3>
                <h3 className={styles.bnbAmount}>{`${bnbBalance}`}</h3>
              </div>
            </div>
          </div>
          <button className={styles.exchangeBtn} onClick={toggleExchangePopup}>CE x CRYV</button>
        </div>
        <div className={styles.inventory}>
          <div className={styles.inventoryHeader}>
            <span className={`${styles.inventoryHeaderNav} ${styles.navActive}`} onClick={addActive}>Serpientes</span>
            <span className={styles.inventoryHeaderNav} onClick={addActive}>Huevos</span>
            <span className={styles.inventoryHeaderNav} onClick={addActive}>Cuevas</span>
          </div>
          <div className={styles.inventoryContent}>
            { (currentContainer == 'Serpientes' || currentContainer == '') ?
              <div className={styles.serpentContainer}>
                <span>Sección en desarrollo</span>  
              </div>
            : (currentContainer == 'Huevos') ? 
              <div className={styles.huevosContainer}>
                <span>Sección en desarrollo</span>
              </div>
            :
              <div className={styles.cuevasContainer}>
                <span>Sección en desarrollo</span>
              </div> 
            }
          </div>
        </div>

        {exchangePopup && (
        <div className={styles.popupExchange}>
          <div className={styles.overlay} onClick={toggleExchangePopup}></div>
          <div className={styles.popupContent}>
            <h2 className={styles.popupTitle}>Intercambiar CE por CRYV</h2>
            <div className={styles.popupHeader}>
              <span className={styles.popupExchangeValue}>100 CE = 1 CRYV</span>
              <span className={styles.popupBalance}>Balance: {`${ceBalance}`}</span>
            </div>
            <div className={styles.popupInputs}>
              <div className={styles.ceInputExchange}>
                <img src="tokeningame.svg" className={styles.tokenIcon}/>
                <input type="number" placeholder="Cantidad de CE" className={styles.inputCE} onChange={changeCRYV} id="exchangeInputCE" autoComplete='off' max="5"/>
                <button className={styles.maxQtyCE} onClick={setMaxCE}>MAX</button>
              </div>
              <img src="exchangeArrow.svg" className={styles.exchangeArrow} />
              <div className={styles.cryvInputExchange}>
                <img src="tokenprincipal.svg" className={styles.cryvIcon}/>
                <input type="number" placeholder="Cantidad de CRYV" className={styles.inputCRYV} onChange={changeCE} id="exchangeInputCRYV" autoComplete='off' />
              </div>
            </div>
            {!loadingSpinner? (
              <button className={styles.confirmBtn} onClick={confirmExchange}>Aceptar</button>
              ):(
              <div className={styles.spinBtn}><Spinner /></div>
            )}
          </div>
        </div>
        )}

        <StatusMessage status={status} isOpen={statusIsOpen} setIsOpen={setStatusIsOpen} />
      </div>
      ) :
        <button className={styles.loginBtn} onClick={() => authenticate({signingMessage: "CryptoViper quiere acceder a tu MetaMask para iniciar sesión"})}>Iniciar Sesión</button>
      }
    </div>
  )

}