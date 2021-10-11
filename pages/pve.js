// Styles
import styles from '../styles/Pve.module.scss'
// Components
import { MoralisProvider } from "react-moralis";
import Pve from '../components/PveGameplay'
import Navbar from '../components/Navbar'

import React from "react";
const appId = "DZETAcxjlLHc4J46gOPZYmqlMWmUQR1fQl59OLkd";
const serverUrl = "https://2bxi0dkc5yna.grandmoralis.com:2053/server";

export default function pve() {
  
  return (
    <div className={styles.container}>
      <MoralisProvider appId={appId} serverUrl={serverUrl}>
        <Navbar />
        <Pve />
      </MoralisProvider>
    </div>
  )
}