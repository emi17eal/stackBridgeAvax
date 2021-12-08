const Web3 = require('web3');

const BridgeEth = require('../build/contracts/BridgeEth.json');
const BridgeAvax = require('../build/contracts/BridgeAvax.json');

const web3Eth = new Web3("wss://speedy-nodes-nyc.moralis.io/c7275baa0c4699224afc74c0/eth/mainnet/ws");
const web3Avax = new Web3('wss://speedy-nodes-nyc.moralis.io/c7275baa0c4699224afc74c0/avalanche/mainnet/ws');

const { address: admin } = web3Avax.eth.accounts.wallet.add(process.env.admin_privateKey);

const bridgeEth = new web3Eth.eth.Contract(
  BridgeEth.abi,
  BridgeEth.networks['1'].address
);

const bridgeAvax = new web3Avax.eth.Contract(
  BridgeAvax.abi,
  BridgeAvax.networks['1'].address
);

totalStackGas = BigInt(0);

bridgeEth.events.Transfer({
  filter: {step: [0]},
  fromBlock: 0
})
.on('data', async event => {
  try {
    const { from, to, amount, date, nonce } = event.returnValues;
    console.log(`nonce: ${nonce}`);
    const gasInStack = BigInt(0);
    const newAmount = BigInt(amount) - gasInStack;
    const tx = bridgeAvax.methods.mint(from, newAmount, nonce);
    const [gasPrice, gasCost] = await Promise.all([
      web3Avax.eth.getGasPrice(),
      tx.estimateGas({from: admin}),
    ]);
    
    const data = tx.encodeABI();
    const txData = {
      from: admin,
      to: bridgeAvax.options.address,
      data,
      gas: gasCost,
      gasPrice
    };
    
    const receipt = await web3Avax.eth.sendTransaction(txData);
    totalStackGas += gasInStack;
    console.log(`
    Transaction hash: ${receipt.transactionHash}
      Processed transfer:
      - from ${from} 
      - to ${from} 
      - nonce ${nonce}
      - amount ${newAmount} STACK
      - date ${date}
      - gas ${gasInStack} STACK
      - total gas ${totalStackGas} STACK
    `);

  } catch(error) {
    console.log(error.message);
  };
});