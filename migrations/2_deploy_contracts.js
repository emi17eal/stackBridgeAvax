const wSTACK = artifacts.require('wSTACK.sol');
const BridgeEth = artifacts.require('BridgeEth.sol');
const BridgeAvax = artifacts.require('BridgeAvax.sol');

module.exports = async function (deployer, network, addresses) {
  if(network === 'EthMainnet') {
    await deployer.deploy(BridgeEth, '0x1bbb57def2f6192f0b9b8565f49034bf1fcdb604');
  }
  if(network === 'AvaxMainnet') {
    await deployer.deploy(wSTACK);
    const wstack = await wSTACK.deployed();
    await deployer.deploy(BridgeAvax, wSTACK.address, '1000000000000000000000');
    const bridgeAvax = await BridgeAvax.deployed();
    await wstack.updateAdmin(bridgeAvax.address);
  }
};