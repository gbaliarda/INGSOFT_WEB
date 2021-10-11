// Styles
import styles from '../styles/Pve.module.scss'
// Components
import { MoralisProvider } from "react-moralis";
import Navbar from '../components/Navbar'
import Account from '../components/Account'

import React from "react";
const appId = "DZETAcxjlLHc4J46gOPZYmqlMWmUQR1fQl59OLkd";
const serverUrl = "https://2bxi0dkc5yna.grandmoralis.com:2053/server";

export default function account() {
  
  return (
    <div className={styles.container}>
      <MoralisProvider appId={appId} serverUrl={serverUrl}>
        <Navbar />
        <Account />
      </MoralisProvider>
    </div>
  )
}