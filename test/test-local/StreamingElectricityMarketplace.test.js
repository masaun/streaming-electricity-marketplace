/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

/// Artifact of the StreamingElectricityMarketplace contract 
const StreamingElectricityMarketplace = artifacts.require("StreamingElectricityMarketplace");
const ElectricityPriceOracle = artifacts.require("ElectricityPriceOracle");
const Marketplace = artifacts.require("Marketplace");
const Marketplace_prev = require("../utils/streamr/build_streamr/contracts/Marketplace20180425.json")
const DataCoin = artifacts.require("DataCoin");

/// Global variable
let streamingElectricityMarketplace;
let electricityPriceOracle;
let marketplace;
let dataCoin;

/// Deployed address (from mainnent): https://github.com/streamr-dev/marketplace-contracts/blob/master/migrations/2_deploy_contracts.js#L6-L10
let STREAMING_ELECTRICITY_MARKETPLACE;
let MARKETPLACE = "0xa10151d088f6f2705a05d6c83719e99e079a61c1"
let DATA_COIN = "0x0Cf0Ee63788A0849fE5297F3407f701E122cC023"  /// https://etherscan.io/address/0x0cf0ee63788a0849fe5297f3407f701e122cc023#code

/// Enum
const { Marketplace: { ProductState, Currency } } = require("../utils/streamr/src/contracts/enums")

/// Test helpers
const { assertReturnValueEqual, assertEvent, assertEqual, assertFails, assertEventBySignature, now } = require("./streamr/testHelpers")


/***
 * @dev - Execution COMMAND: $ truffle test ./test/test-local/StreamingElectricityMarketplace.test.js
 **/
contract("StreamingElectricityMarketplace", function(accounts) {

    /// @dev - Use testIndex in order to avoid duplicated-productId
    let testIndex = 0;

    describe("Setup smart-contracts", () => {
        it("Check all accounts", async () => {
            console.log('=== accounts ===\n', accounts);
        });        

        it("Setup ElectricityPriceOracle contract instance", async () => {
            electricityPriceOracle = await ElectricityPriceOracle.new({ from: accounts[0] });
        });        

        it("Setup DataCoin contract instance", async () => {
            //dataCoin = await DataCoin.at(DATA_COIN, { from: accounts[0] });
            dataCoin = await DataCoin.new({ from: accounts[0] });
        }); 

        it("Setup Marketplace contract instance (inherit from the Mainnet address)", async () => {
            //marketplace = await Marketplace.at(MARKETPLACE, { from: accounts[0] });
        }); 

        it("Setup Marketplace contract instance (stand alone)", async () => {
            const datacoinAddress = dataCoin.address;
            const currencyUpdateAgentAddress = accounts[8];

            /// Deploy the Marketplace20180425.sol
            marketplace_prev = await Marketplace_prev.new(datacoinAddress, currencyUpdateAgentAddress, { from: accounts[0] });

            /// Deploy the Marketplace.sol
            const prev_marketplace_address = marketplace_prev.address;  /// [Todo]: Assign mainnet address from ../utils/streamr/build/contracts/Marketplace20180425.json
            marketplace = await Marketplace.new(datacoinAddress, currencyUpdateAgentAddress, prev_marketplace_address, { from: accounts[0] });

            // w3.eth.getBlock("latest").then((block) => {console.log("gasLimit: " + block.gasLimit)});

            // const productId = "test-e2e"
            // const productIdHex = w3.utils.utf8ToHex(productId)
            // await market.methods.createProduct(productIdHex, "End-to-end tester", accounts[3], 1, Currency.DATA, 1)
            //     .send({from: accounts[0], gas: 4000000})
            // await token.methods.mint(accounts[1], 100000).send({from: accounts[0], gas: 4000000})
            // await token.methods.approve(market.options.address, 10000).send({from: accounts[1], gas: 4000000})

            // TODO: find out why the following fails
            // await market.methods.buy(productIdHex, 10).send({from: accounts[1], gas: 4000000})
        })

        it("Setup StreamingElectricityMarketplace contract instance", async () => {
            const _electricityPriceOracle = electricityPriceOracle.address;
            const _marketplace = marketplace.address;
            const _dataCoin = dataCoin.address;
            streamingElectricityMarketplace = await StreamingElectricityMarketplace.new(_electricityPriceOracle,
                                                                                        _marketplace,
                                                                                        _dataCoin,
                                                                                        { from: accounts[0] });
            STREAMING_ELECTRICITY_MARKETPLACE = streamingElectricityMarketplace.address;
        });
    });

    describe("Mint the DataCoin", () => {
        it("1000 DataCoin is minted for buyer (accounts[1])", async () => {
            const to = accounts[1];
            const mintAmount = web3.utils.toWei('1000', 'ether');
            await dataCoin.mint(to, mintAmount, { from: accounts[0] });

            const dataCoinBalance = await dataCoin.balanceOf(accounts[1], { from: accounts[1] });
            console.log('=== DataCoin balance of buyer (accounts[1]) ===', String(dataCoinBalance));
        });
    });

    describe("Subscription", () => {
        const testToleranceSeconds = 5
        testIndex += 1

        /// product created in 2, subcription bought in 2
        const productId = web3.utils.padLeft(web3.utils.asciiToHex(`Energy_Asset_${testIndex}`), 64)        
        console.log('=== productId ===', productId);

        it("createProduct", async () => {
            const name = `Energy_Asset_${testIndex}`;
            const beneficiary = accounts[3];
            const pricePerSecond = 1;
            const currency = Currency.DATA;
            const minimumSubscriptionSeconds = 1;
            await streamingElectricityMarketplace.createProduct(productId, name, beneficiary, pricePerSecond, currency, minimumSubscriptionSeconds, { from: accounts[0] })
        })

        it("buyProduct", async () => {
            const pricePerSecond = 1;  /// [Note]: This value from saved-amount when createProduct() above was executed
            const subscriptionSeconds = 100;
            let purchaseAmount = pricePerSecond * subscriptionSeconds;
            //let purchaseAmount = web3.utils.toWei(`${ pricePerSecond * subscriptionSeconds }`, 'ether');
            await dataCoin.approve(STREAMING_ELECTRICITY_MARKETPLACE, purchaseAmount, { from: accounts[1] })
            await streamingElectricityMarketplace.buyProduct(productId, subscriptionSeconds, purchaseAmount, { from: accounts[1] })
        })

        it("grant fails for non-owner", async () => {
            await assertFails(streamingElectricityMarketplace.grantSubscription(productId, 100, accounts[5], { from: accounts[5] }))
        })

        it("grant works for owner", async () => {
            async function testGrant(_productId) {
                const subBefore = await streamingElectricityMarketplace.getSubscriptionTo(_productId, { from: accounts[5] })
                streamingElectricityMarketplace.grantSubscription(_productId, 100, accounts[5], { from: accounts[0] })
                const subAfter = await streamingElectricityMarketplace.getSubscriptionTo(_productId, { from: accounts[5] })
                assert(subAfter.isValid)
                assert(subAfter.endTimestamp - subBefore.endTimestamp > 100 - testToleranceSeconds)
            }
            await testGrant(productId)
        })

        it("subscription can be extended (when subscrioption period is end and if a user pay)", async () => {
            async function testExtension(pid) {
                const subBefore = await streamingElectricityMarketplace.getSubscriptionTo(pid, { from: accounts[1] })
                assert(subBefore.isValid)
                await streamingElectricityMarketplace.buyProduct(pid, 100, { from: accounts[1] })
                const subAfter = await streamingElectricityMarketplace.getSubscriptionTo(pid, { from: accounts[1] })
                assert(subAfter.isValid)
                assert(subAfter.endTimestamp - subBefore.endTimestamp > 100 - testToleranceSeconds)
            }
            await testExtension(productId)
        })

    })

});
