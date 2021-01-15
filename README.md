# streaming-electricity-marketplace-with-datatoken

***
## 【Introduction of the streaming-electricity-marketplace-with-datatoken】
- This is a smart contract for ...

&nbsp;

***

## 【Workflow】


&nbsp;

***

## 【Remarks】
- Version for following the Streamer smart contract
  - Solidity (Solc): v0.5.16
  - openzeppelin-solidity: v2.5.0

&nbsp;

***

## 【Setup】
### ① Install modules
```
$ npm install
```

<br>

### ② Compile & migrate contracts (on local)
```
$ npm run migrate:local
```

<br>

### ③ Test (Mainnet-fork approach)
- 1: Start ganache-cli with mainnet-fork
```
$ ganache-cli --fork https://mainnet.infura.io/v3/{YOUR INFURA KEY}@{BLOCK_NUMBER}
```

<br>

- 2: Execute test of contracts (on the local)
```
$ npm run test:streaming
($ truffle test ./test/test-local/StreamingElectricityMarketplace.test.js)
```

<br>


***

## 【References】
- Streamer
  - Marketplace smart-contract（Solidity v0.5.16）：https://github.com/streamr-dev/marketplace-contracts 
  - Doc（Data Union）：https://streamr.network/docs/data-unions/intro-to-data-unions
  - Devpost（Hacker Guide）：https://oceandec.devpost.com/details/hackerguide
  - Slide：https://docs.google.com/presentation/d/1QjBD3s-2fS-CrETtPAHrSR4PuFFSRFvvimJOCQbmvGI/edit#slide=id.g875ff90d1f_0_0
  - Streamr Data Challenge 2021：https://www.streamrdatachallenge.com

<br>

- Truffle test
  - Mainnet-fork approach with Ganache-CLI and Infura   
https://medium.com/@samajammin/how-to-interact-with-ethereums-mainnet-in-a-development-environment-with-ganache-3d8649df0876    
(Current block number @ mainnet: https://etherscan.io/blocks )    
