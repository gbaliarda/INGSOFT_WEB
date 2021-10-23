// Libraries
import React from "react";
// Styles
import styles from '../styles/Home.module.scss'
// Components
import Landing from '../components/Landing'
import { MoralisProvider } from "react-moralis";
const appId = "DZETAcxjlLHc4J46gOPZYmqlMWmUQR1fQl59OLkd";
const serverUrl = "https://2bxi0dkc5yna.grandmoralis.com:2053/server";

export default function Home() {
  return (
    <div className={styles.container}>
      <MoralisProvider appId={appId} serverUrl={serverUrl}>
        <Landing />
      </MoralisProvider>
    </div>
  )
}