import React from 'react';
import styles from '../styles/Pve.module.css'

const Snake = (props) => {
  return (
    <div>
      {props.snakeDots.map((dot, i) => {
        const style = {
          left: `${dot[0]}%`,
          top: `${dot[1]}%`
        }
        return (
          <div className={styles.snakeDot} key={i} style={style}></div>
        )
      })}
    </div>
  )
}

export default Snake;