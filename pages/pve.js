// Styles
import styles from '../styles/Pve.module.scss'
// Components
import NavWrapper from '../components/NavWrapper'
import Pve from '../components/PveGameplay'

import React from "react";

export default function pve() {
  return (
    <div className={styles.container}>
      <NavWrapper />
      <Pve />
    </div>
  )
}