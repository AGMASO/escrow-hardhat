import { ethers } from "ethers";
import { useEffect, useState } from "react";
import deploy from "./deploy";
import Escrow from "./Escrow";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  async function newContract() {
    const beneficiary = document.getElementById("beneficiary").value;
    const arbiter = document.getElementById("arbiter").value;
    const value = ethers.utils.parseEther(document.getElementById("eth").value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
      handleApprove: async () => {
        escrowContract.on("Approved", () => {
          document.getElementById(escrowContract.address).className =
            "complete";
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow]);
  }

  return (
    <>
      <div className='wrapper'>
        <div className='contract'>
          <h1> Create a New Escrow Contract </h1>
          <label>
            Arbiter Address
            <input type='text' id='arbiter' />
          </label>

          <label>
            Beneficiary Address
            <input type='text' id='beneficiary' />
          </label>

          <label>
            Deposit Amount (in Ethereum)
            <input type='text' id='eth' />
          </label>

          <div
            className='button'
            id='deploy'
            onClick={(e) => {
              e.preventDefault();

              newContract();
            }}
          >
            Deploy to Testnet
          </div>
        </div>
        {escrows.length > 0 ? (
          <div className='existing-contract'>
            <div id='container'>
              {escrows.map((escrow) => {
                return <Escrow key={escrow.address} {...escrow} />;
              })}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
}

export default App;
