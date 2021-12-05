const Web3 = require('web3');
const { ChainId, Fetcher, WETH, Route} = require('@uniswap/sdk');
const BridgeEth = require('../build/contracts/BridgeEth.json');
const BridgeAvax = require('../build/contracts/BridgeAvax.json');

const web3Eth = new Web3("wss://speedy-nodes-nyc.moralis.io/c7275baa0c4699224afc74c0/eth/rinkeby/ws");
const web3Avax = new Web3('wss://speedy-nodes-nyc.moralis.io/c7275baa0c4699224afc74c0/avalanche/testnet/ws');

const { address: admin } = web3Eth.eth.accounts.wallet.add(process.env.admin_privateKey);


const chainId = ChainId.MAINNET;
const stackaddress = '0x1bbb57def2f6192f0b9b8565f49034bf1fcdb604';

const bridgeEth = new web3Eth.eth.Contract(
  BridgeEth.abi,
  BridgeEth.networks['4'].address
);

const bridgeAvax = new web3Avax.eth.Contract(
  BridgeAvax.abi,
  BridgeAvax.networks['1'].address
);

totalStackGas = BigInt(0);

bridgeAvax.events.Transfer({
  fromBlock: 0,
  filter: {step: [0]}
})
.on('data', async event => {
  try {
    const { from, to, amount, date, nonce } = event.returnValues;
    console.log(`nonce: ${nonce}`);
    const dummyTx = bridgeEth.methods.withdraw(from, amount, nonce);
    const [dummyGasPrice, dummyGasCost] = await Promise.all([
      web3Eth.eth.getGasPrice(),
      dummyTx.estimateGas({from: admin})
    ]);
    const stack = await Fetcher.fetchTokenData(chainId, stackaddress);
    const weth = WETH[chainId];
    const pair = await Fetcher.fetchPairData(stack, weth);
    const route = new Route ([pair], weth);
    const oneEthInStack = route.midPrice.toSignificant(6);
    const oneEthInStackInWei = Web3.utils.toWei(oneEthInStack, 'ether');
    const oneEthInWei = Web3.utils.toWei('1', 'ether');
    const totalGas = dummyGasPrice * dummyGasCost;
    const gasInStack = (totalGas/oneEthInWei)*oneEthInStackInWei;
    const newAmount = BigInt(amount) - BigInt(gasInStack) - BigInt(100000000000000000000);
    const tx = bridgeEth.methods.withdraw(from, newAmount, nonce);
    const [gasPrice, gasCost] = await Promise.all([
      web3Eth.eth.getGasPrice(),
      tx.estimateGas({from: admin})
    ]);
    const data = tx.encodeABI();
    const txData = {
      from: admin,
      to: bridgeEth.options.address,
      data,
      gas: gasCost,
      gasPrice
    };

    const receipt = await web3Eth.eth.sendTransaction(txData);

    totalStackGas += BigInt(gasInStack);

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