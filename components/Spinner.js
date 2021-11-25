import styles from './styles/Spinner.module.scss'

export default function Spinner({ color = "#fff" }) {
  return(
    <div className={styles.spinWrapper}>
      <div className={styles.spinner} style={{ borderLeftColor: color, borderRightColor: color }}></div>
    </div>
  );
}