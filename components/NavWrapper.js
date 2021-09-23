import { MoralisProvider } from "react-moralis";
import Navbar from './Navbar'

const appId = "DZETAcxjlLHc4J46gOPZYmqlMWmUQR1fQl59OLkd";
const serverUrl = "https://2bxi0dkc5yna.grandmoralis.com:2053/server";

export default function NavWrapper() {

  return (
    <MoralisProvider appId={appId} serverUrl={serverUrl}>
      <Navbar />
    </MoralisProvider>
  )

}