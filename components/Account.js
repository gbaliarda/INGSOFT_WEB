import styles from './styles/Account.module.scss'
import { useMoralis } from "react-moralis";
import Moralis from 'moralis';
import React, { useState, useMemo, useEffect } from "react";
import { useTab } from '@chakra-ui/tabs';

const cryvTokenAddress = "0xd1af9c4f9ba37d0c889353515898b479022355f5";

export default function Account() {
  const [exchangePopup, setExchangePopup] = useState(false);
  const [cryvBalance, setCryvBalance] = useState(0);
  const [ceBalance, setCeBalance] = useState(0);
  const [bnbBalance, setBnbBalance] = useState(0);

  const { isAuthenticated, user } = useMoralis();

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
  
    setCryvBalance(results.balance/(10**18));
  
  }

  async function getCeToken() {
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
      user.set("ceAmount", parseInt(user.attributes.ceAmount-ceToExchange));
      await user.save();
    } catch (e) {
      console.log(e);
    }
    toggleExchangePopup();
  }

  async function testing() {
    const query = new Moralis.Query("BscTokenBalance");

    const result = await query.map((token) => token.attributes);
    console.log(result);
  }

  useEffect(() => {
    getCryptoViperToken();
    getCeToken();
    getBnbToken();


  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mi cuenta</h2>
      <div className={styles.accountHeader}>
        <div className={styles.balance}>
          <div className={styles.showCryv}>
            <img src="tokenprincipal.svg" alt="CryptoViper token" className={styles.cryvLogo}/>
            <div className={styles.cryvDetails}>
              <h3 className={styles.cryvTitle}>CRYV</h3>
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
        <button className={styles.exchangeBtn} onClick={toggleExchangePopup}>CE <img src="swap-horizontal.svg" alt="por" className={styles.swapIcon} /> CRYV</button>
      </div>

      {exchangePopup && (
      <div className={styles.popupExchange}>
        <div className={styles.overlay} onClick={toggleExchangePopup}></div>
        <div className={styles.popupContent}>
          <h2 className={styles.popupTitle}>Intercambiar CE por CRYV</h2>
          <p className={styles.popupBalance}>Balance: {`${ceBalance}`}</p>
          <div className={styles.popupInputs}>
            <input type="number" placeholder="Cantidad de CE" className={styles.inputCE} onChange={changeCRYV} id="exchangeInputCE" autoComplete='off' max="5"/>
            <button className={styles.maxQtyCE} onClick={setMaxCE}>MAX</button>
            <img src="icons8-arrow-48.png" />
            <input type="number" placeholder="Cantidad de CRYV" className={styles.inputCRYV} onChange={changeCE} id="exchangeInputCRYV" autoComplete='off' />
          </div>
          <button className={styles.confirmBtn} onClick={confirmExchange}>Aceptar</button>
        </div>
      </div>
      )}
    </div>
  )

}