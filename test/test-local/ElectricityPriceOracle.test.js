/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

/// Artifact of the ElectricityPriceOracle.test contract 
const ElectricityPriceOracle = artifacts.require("ElectricityPriceOracle");

/// Global variable
let electricityPriceOracle;


/***
 * @dev - Execution COMMAND: $ truffle test ./test/test-local/ElectricityPriceOracle.test.js
 **/
contract("ElectricityPriceOracle", function(accounts) {

    describe("Setup smart-contracts", () => {
        it("Check all accounts", async () => {
            console.log('=== accounts ===\n', accounts);
        });        

        it("Setup ElectricityPriceOracle contract instance", async () => {
            electricityPriceOracle = await ElectricityPriceOracle.new({ from: accounts[0] });
        });
    });

});
