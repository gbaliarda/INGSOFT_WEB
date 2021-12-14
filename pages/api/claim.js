import Web3 from 'web3'
import Provider from '@truffle/hdwallet-provider'
import CryvContract from '../../contracts/CRYVToken.json'
CryvContract.address = "0xd1aF9c4f9ba37D0c889353515898B479022355f5";

const address = '0x2fc65B3b3FBb39F94Cbf8371b6C455E7A0e082F2';
const privateKey = '35a29d54cc1bdef892cd67f699c94ee0108a2790f4126f993b326048d3ea63cc';
const bscTestnet = "https://data-seed-prebsc-1-s1.binance.org:8545";

const provider = new Provider(privateKey, bscTestnet); 
const web3 = new Web3(provider);
const cryvContract = new web3.eth.Contract(
  CryvContract.abi,
  CryvContract.address
);

async function sendTokens(recipient, amount) {
  amount = Web3.utils.toWei(amount, "ether");
  try {
    const receipt = await cryvContract.methods.transfer(recipient, amount).send({ from: address });
    return {
      error: false,
      message: receipt.transactionHash,
    }
  } catch(e) {
    return {
      error: true,
      message: "Transaction failed",
    }
  }
}

export default function handler(req, res) {
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
    return
  }

  const { recipient, cryvWanted, ceBalance } = req.body;

  if (!recipient || !cryvWanted || !ceBalance) {
    res.status(400).json({ message: "Missing parameters" });
    return;
  }

  if (isNaN(cryvWanted) || cryvWanted <= 0) {
    res.status(400).json({ message: "Invalid CRYV amount" });
    return;
  }

  const ratioCeCryv = 100;
  if (ceBalance / ratioCeCryv < cryvWanted) {
    res.status(400).json({ message: "Insufficient CE" });
    return;
  }

  const data = await sendTokens(recipient, cryvWanted.toString());

  if (data.error)
    res.status(500).json({ message: data.message })
  else
    res.status(200).json({ message: data.message })

}