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

/// Enum
const { Marketplace: { ProductState, Currency } } = require("../utils/streamr/src/contracts/enums")


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

    describe("Subscription", () => {
        const testToleranceSeconds = 5

        /// product created in 2, subcription bought in 2
        const productId2 = web3.utils.padLeft(web3.utils.asciiToHex("test_sub2"), 64)        
        console.log('=== productId2 ===', productId2);

        before(async () => {
            await marketplace.createProduct(productId2, "test", accounts[3], 1, Currency.DATA, 1, { from: accounts[0] })
            await dataCoin.approve(MARKETPLACE, 1000, { from: accounts[1] })
            await marketplace.buyProduct(productId2, 100, { from: accounts[1] })
        })

        it("grant fails for non-owner", async () => {
            await assertFails(marketplace.grantSubscription(productId2, 100, accounts[5], { from: accounts[5] }))
        })

        it("grant works for owner", async () => {
            async function testGrant(_productId) {
                const subBefore = await marketplace.getSubscriptionTo(_productId, { from: accounts[5] })
                marketplace.grantSubscription(_productId, 100, accounts[5], { from: accounts[0] })
                const subAfter = await marketplace.getSubscriptionTo(_productId, { from: accounts[5] })
                assert(subAfter.isValid)
                assert(subAfter.endTimestamp - subBefore.endTimestamp > 100 - testToleranceSeconds)
            }
            await testGrant(productId2)
        })

        it("subscription can be extended (when subscrioption period is end and if a user pay)", async () => {
            async function testExtension(pid) {
                const subBefore = await marketplace.getSubscriptionTo(pid, { from: accounts[1] })
                assert(subBefore.isValid)
                await marketplace.buyProduct(pid, 100, { from: accounts[1] })
                const subAfter = await marketplace.getSubscriptionTo(pid, { from: accounts[1] })
                assert(subAfter.isValid)
                assert(subAfter.endTimestamp - subBefore.endTimestamp > 100 - testToleranceSeconds)
            }
            await testExtension(productId2)
        })

    })

});
