/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

/// Artifact of the StreamingElectricityMarketplace contract 
const StreamingElectricityMarketplace = artifacts.require("OceanFarmingToken");
const ElectricityPriceOracle = artifacts.require("ElectricityPriceOracle");
const Marketplace = artifacts.require("Marketplace");
const DataToken = artifacts.require("DataToken");

/// Global variable
let streamingElectricityMarketplace;
let electricityPriceOracle;
let marketplace;
let dataToken;


/***
 * @dev - Execution COMMAND: $ truffle test ./test/test-local/StreamingElectricityMarketplace.test.js
 **/
contract("StreamingElectricityMarketplace", function(accounts) {

    describe("Setup", () => {
        it("Check all accounts", async () => {
            console.log('=== accounts ===\n', accounts);
        });        

        it("Setup ElectricityPriceOracle contract instance", async () => {
            electricityPriceOracle = await ElectricityPriceOracle.new({ from: accounts[0] });
        });        

        it("Setup Marketplace contract instance", async () => {
            marketplace = await Marketplace.new({ from: accounts[0] });
        }); 

        it("Setup DataToken contract instance", async () => {
            dataToken = await DataToken.new({ from: accounts[0] });
        }); 

        it("Setup StreamingElectricityMarketplace contract instance", async () => {
            const _electricityPriceOracle = electricityPriceOracle.address;
            const _marketplace = marketplace.address;
            const _dataToken = dataToken.address;
            streamingElectricityMarketplace = await StreamingElectricityMarketplace.new(_electricityPriceOracle,
                                                                                        _marketplace,
                                                                                        _dataToken,
                                                                                        { from: accounts[0] });
        });
    });
});
