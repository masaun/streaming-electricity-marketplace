/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

/// Artifact of the StreamingElectricityMarketplace contract 
const StreamingElectricityMarketplace = artifacts.require("StreamingElectricityMarketplace");
const ElectricityPriceOracle = artifacts.require("ElectricityPriceOracle");
const Marketplace = artifacts.require("Marketplace");
const DataCoin = artifacts.require("DataCoin");

/// Global variable
let streamingElectricityMarketplace;
let electricityPriceOracle;
let marketplace;
let dataCoin;

/// Deployed address (from mainnent): https://github.com/streamr-dev/marketplace-contracts/blob/master/migrations/2_deploy_contracts.js#L6-L10
const MARKETPLACE = "0xa10151d088f6f2705a05d6c83719e99e079a61c1"
const DATA_COIN = "0x0Cf0Ee63788A0849fE5297F3407f701E122cC023"  /// https://etherscan.io/address/0x0cf0ee63788a0849fe5297f3407f701e122cc023#code


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
            marketplace = await Marketplace.at(MARKETPLACE, { from: accounts[0] });
        }); 

        it("Setup DataCoin contract instance", async () => {
            dataCoin = await DataCoin.new({ from: accounts[0] });
        }); 

        it("Setup StreamingElectricityMarketplace contract instance", async () => {
            const _electricityPriceOracle = electricityPriceOracle.address;
            const _marketplace = marketplace.address;
            const _dataCoin = dataCoin.address;
            streamingElectricityMarketplace = await StreamingElectricityMarketplace.new(_electricityPriceOracle,
                                                                                        _marketplace,
                                                                                        _dataCoin,
                                                                                        { from: accounts[0] });
        });
    });
});
