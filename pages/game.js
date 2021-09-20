// Styles
import styles from '../styles/Game.module.css'
// Components
import Navbar from '../components/Navbar'
import Pve from '../components/Pve'

import React from "react";
import ReactDOM from "react-dom";
import { MoralisProvider } from "react-moralis";

const appId = "DZETAcxjlLHc4J46gOPZYmqlMWmUQR1fQl59OLkd";
const serverUrl = "https://2bxi0dkc5yna.grandmoralis.com:2053/server";

export default function Home() {
  return (
    <div className={styles.container}>
      <MoralisProvider appId={appId} serverUrl={serverUrl}>
        <Navbar />
      </MoralisProvider>
      <Pve />
    </div>
  )
}