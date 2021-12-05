const STACK = artifacts.require('STACK.sol');
const wSTACK = artifacts.require('wSTACK.sol');
const BridgeEth = artifacts.require('BridgeEth.sol');
const BridgeAvax = artifacts.require('BridgeAvax.sol');

module.exports = async function (deployer, network, addresses) {
  if(network === 'EthTestnet') {
    await deployer.deploy(STACK);
    const stack = await STACK.deployed();
    await stack.mint('0x6b68DC91F3440c4Ae9A85521bFaaa2A8daC5da96', '1000000000000000000000000');
    await deployer.deploy(BridgeEth, stack.address);
    const bridgeEth = await BridgeEth.deployed();
    await stack.updateAdmin(bridgeEth.address);
  }
  if(network === 'BscTestnet') {
    await deployer.deploy(wSTACK);
    const wstack = await wSTACK.deployed();
    await deployer.deploy(BridgeBsc, wSTACK.address, '1000000000000000000000', false);
    const bridgeBsc = await BridgeBsc.deployed();
    await wstack.updateAdmin(bridgeBsc.address);
  }
  if(network === 'FtmTestnet') {
    await deployer.deploy(wSTACK);
    const wstack = await wSTACK.deployed();
    await deployer.deploy(BridgeBsc, wSTACK.address, '1000000000000000000000', false);
    const bridgeBsc = await BridgeBsc.deployed();
    await wstack.updateAdmin(bridgeBsc.address);
  }
  if(network === 'MaticTestnet') {
    await deployer.deploy(wSTACK);
    const wstack = await wSTACK.deployed();
    await deployer.deploy(BridgeBsc, wSTACK.address, '1000000000000000000000', false);
    const bridgeBsc = await BridgeBsc.deployed();
    await wstack.updateAdmin(bridgeBsc.address);
  }
  if(network === 'AvaxTestnet') {
    await deployer.deploy(wSTACK);
    const wstack = await wSTACK.deployed();
    await deployer.deploy(BridgeAvax, wSTACK.address, '1000000000000000000000');
    const bridgeAvax = await BridgeAvax.deployed();
    await wstack.updateAdmin(bridgeAvax.address);
  }
};