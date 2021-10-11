
import styles from './styles/StatusMessage.module.scss'

export default function StatusMessage({status, isOpen, setIsOpen}) {
  function closeStatusMessage() {
    setIsOpen(false);
  }

  return(
    <div>
      { isOpen &&
      <div className={!status.error ? styles.successMessage:styles.errorMessage} onClick={closeStatusMessage}>
        <p className={styles.message}>{status.message}</p>
      </div>
      }
    </div>
  );
}