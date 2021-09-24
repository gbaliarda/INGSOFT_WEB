// Libraries
import React from "react";
// Styles
import styles from '../styles/Home.module.scss'
// Components
import NavWrapper from '../components/NavWrapper'
import Landing from '../components/Landing'

export default function Home() {
  return (
    <div className={styles.container}>
      <NavWrapper />
      <Landing />
    </div>
  )
}