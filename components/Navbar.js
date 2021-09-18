import styles from './styles/Navbar.module.css'
import { ethers } from "ethers";
// import { useMoralis } from "react-moralis";
import abi from "./data/abi.json";
const cryvTokenAddress = "0xd1aF9c4f9ba37D0c889353515898B479022355f5";


export default function Navbar() {
  // const {authenticate} = useMoralis();

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function getTotalSupply() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(cryvTokenAddress, abi.abi, provider)
      try {
        const data = await contract.balanceOf(address);
        console.log('Total Supply: ', (data / 10**18).toString())
      } catch (err) {
        console.log(err)
      }
    }    
  }

  return (
    <nav className={styles.nav}>
      <a href="#">CryptoViper</a>
      <div className={styles.links}>
        <a href="#">Inicio</a>
        <a href="#">WhitePaper</a>
        
        <button onClick={requestAccount} className={styles.loginMetaMask}>Entrar con MetaMask</button>
        <button onClick={getTotalSupply}>Get Total Supply</button>
      </div>
    </nav>
  )

}