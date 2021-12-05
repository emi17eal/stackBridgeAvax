// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Istack.sol";

contract BridgeAvax is Ownable {
    
  address nullAddress = 0x0000000000000000000000000000000000000000;
  Istack public wSTACK;
  uint public nonce;
  uint public minimumBurn;
  bool public paused;
  mapping(uint => bool) public processedNonces;
  mapping(address => bool) bridged;
  address [] bridgers;
  

  enum Step { burn, mint }
  event Transfer(
    address from,
    address to,
    uint amount,
    uint date,
    uint nonce,
    Step indexed step
  );
    

  constructor (address _wstackAddress, uint _minimumBurn) {
    wSTACK = Istack(_wstackAddress);
    minimumBurn = _minimumBurn;
    paused = true;
  }

  function burn(uint amount) external onlyNotBridged() {
    require(!paused, 'bridging is paused');
    require(amount >= minimumBurn, 'minimum bridge amount not met');
    bridged[msg.sender] = true;
    bridgers.push(msg.sender);
    wSTACK.burn(msg.sender, amount);
    emit Transfer(
      msg.sender,
      nullAddress,
      amount,
      block.timestamp,
      nonce,
      Step.burn
      );
    nonce++;
  }

  function mint(address to, uint amount, uint otherChainNonce) external onlyOwner{
    require(processedNonces[otherChainNonce] == false, 'transfer already processed');
    processedNonces[otherChainNonce] = true;
    wSTACK.mint(to, amount);
    emit Transfer(
      msg.sender,
      to,
      amount,
      block.timestamp,
      otherChainNonce,
      Step.mint
    );
  }

  function setPause(bool _paused) external onlyOwner {
    paused = _paused;
  }

  function setMinimumBurn(uint _minimumBurn) external onlyOwner {
    minimumBurn = _minimumBurn;
  }

  function resetBridgeEpoch () external onlyOwner {
    for (uint i=0; i< bridgers.length ; i++){
      bridged[bridgers[i]] = false;
    }
  }

  modifier onlyNotBridged () {
    require(bridged[msg.sender] == false, 'you have already bridged in this epoch'); 
    _;
  }
}