/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

/// Helper for getting Events of Provable-Things
const { waitForEvent } = require('../utils/provable-things/getEventsHelper.js');

/// Artifact of the StreamingElectricityMarketplace contract 
const StreamingElectricityMarketplace = artifacts.require("StreamingElectricityMarketplace");
const ElectricityPriceOracle = artifacts.require("ElectricityPriceOracle");
const Marketplace = artifacts.require("Marketplace");
const Marketplace_prev = artifacts.require("Marketplace20180425")
const DataCoin = artifacts.require("DataCoin");

/// Deployed address (from mainnent): https://github.com/streamr-dev/marketplace-contracts/blob/master/migrations/2_deploy_contracts.js#L6-L10
let STREAMING_ELECTRICITY_MARKETPLACE;
let MARKETPLACE;
let DATA_COIN;
//let MARKETPLACE = "0xa10151d088f6f2705a05d6c83719e99e079a61c1"
//let DATA_COIN = "0x0Cf0Ee63788A0849fE5297F3407f701E122cC023"  /// https://etherscan.io/address/0x0cf0ee63788a0849fe5297f3407f701e122cc023#code

/// Enum
const { Marketplace: { ProductState, Currency } } = require("../utils/streamr/src/contracts/enums")

/// Test helpers
const { assertReturnValueEqual, assertEvent, assertEqual, assertFails, assertEventBySignature, now } = require("./streamr/testHelpers")


/***
 * @dev - Execution COMMAND: $ truffle test ./test/test-local/StreamingElectricityMarketplace.test.js
 **/
contract("StreamingElectricityMarketplace", function(accounts) {
    /// Global variable for contract instances
    let streamingElectricityMarketplace;
    let electricityPriceOracle;
    let marketplace;
    let dataCoin;

    /// Globalc variable for oracle
    let electricPriceUSD;

    /// @dev - Use testIndex in order to avoid duplicated-productId
    this.testIndex = 0;

    describe("Setup smart-contracts", () => {
        it("Check all accounts", async () => {
            console.log('=== accounts ===\n', accounts);
        });        

        it("Setup ElectricityPriceOracle contract instance", async () => {
            /// [Note]: Transfer 1 ETH for executing the updateElectric() method in the constructor
            electricityPriceOracle = await ElectricityPriceOracle.new({ from: accounts[0], value: web3.utils.toWei("1", "ether") });
        });        

        it("Setup DataCoin contract instance", async () => {
            //dataCoin = await DataCoin.at(DATA_COIN, { from: accounts[0] });
            dataCoin = await DataCoin.new({ from: accounts[0] });
        }); 

        // it("Setup Marketplace contract instance (inherit from the Mainnet address)", async () => {
        //     marketplace = await Marketplace.at(MARKETPLACE, { from: accounts[0] });
        // }); 

        it("Setup Marketplace contract instance (stand alone)", async () => {
            const datacoinAddress = dataCoin.address;
            const currencyUpdateAgentAddress = accounts[8];

            /// Deploy the Marketplace20180425.sol (Marketplace_prev)
            marketplace_prev = await Marketplace_prev.new(datacoinAddress, currencyUpdateAgentAddress, { from: accounts[0] });

            /// Deploy the Marketplace.sol
            const prev_marketplace_address = marketplace_prev.address;  /// [Note]: Using Marketplace20180425.sol
            marketplace = await Marketplace.new(datacoinAddress, currencyUpdateAgentAddress, prev_marketplace_address, { from: accounts[0] });
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

    describe("Retrieve current energy price via oracle", () => {
        it('sends an electricity price query and receives a response', async function () {
            /// set this test to timeout after 1 minute
            this.timeout(60 * 1000)

            /// Step1: Execute the updateElectric() method in ElectricityPriceOracle.sol
            const result = await electricityPriceOracle.updateElectric({
                from: accounts[0],
                value: web3.utils.toWei('1', 'ether'),
                gas: '5000000',
            })

            /// Step2: Listen for NewPrice event to check for Oraclize's call to _callback
            const { contract } = await electricityPriceOracle;

            const { methods, events } = new web3.eth.Contract(
                contract._jsonInterface,
                contract._address
            );

            const {              /// Retrieve the returned value of NewPrice Event
                returnValues: {  /// [Note]: "what", "price", "id" are parameters of the NewPrice Event in ElectricityPriceOracle.sol
                    what, 
                    price, 
                    id
                }
            } = await waitForEvent(events.NewPrice);

            /// [Note]: The average price of electricity in the world for households
            electricPriceUSD = price;
            console.log('\n=== electricPriceUSD (USD per kWh) ===', parseFloat(price));  /// [Result]: 0.13 (USD per kWh)
        });
    });

    describe("Subscription", () => {
        /// Monthly plan purchased is the plan of 100kw/month
        function monthlySubscriptionPlanPricePerSecond(unitEnergyPrice) {
            const kwPerMonth = 100;  /// 100kw/month
            const _purchaseMonthlyPlanPerSecond = unitEnergyPrice * kwPerMonth;
            return _purchaseMonthlyPlanPerSecond;
        }

        function monthlySubscriptionPlan(pricePerSecond, subscriptionSeconds) {
            month = 2592000; /// [Note]: 1 month == 2592000 seconds
            return pricePerSecond * subscriptionSeconds;
        }

        const testToleranceSeconds = 5
        this.testIndex += 1

        /// product created in 2, subcription bought in 2
        const productId = web3.utils.padLeft(web3.utils.asciiToHex(`Energy_Asset_${testIndex}`), 64)        
        console.log('=== productId ===', productId);

        it("createProduct", async () => {
            const name = `Energy_Asset_${testIndex}`;
            const beneficiary = accounts[3];
            const pricePerSecond = monthlySubscriptionPlanPricePerSecond(electricPriceUSD);
            //const pricePerSecond = 1;
            const currency = Currency.DATA;
            const minimumSubscriptionSeconds = 1;
            await streamingElectricityMarketplace.createProduct(productId, name, beneficiary, pricePerSecond, currency, minimumSubscriptionSeconds, { from: accounts[0] })
        })

        it("buyProduct (Buy a subscription plan of 100kw/month)", async () => {
            /// [Note]: This value from saved-amount of the Product struct (in the Marketplace.sol) when createProduct() above was executed
            /// [Note]: This assume that a user buy a subscription plan of 100kw/month
            const pricePerSecond = monthlySubscriptionPlanPricePerSecond(electricPriceUSD);            
            const subscriptionSeconds = 2592000; /// [Note]: 1 month == 2592000 seconds
            let purchaseAmount = monthlySubscriptionPlan(pricePerSecond, subscriptionSeconds);

            await dataCoin.approve(STREAMING_ELECTRICITY_MARKETPLACE, purchaseAmount, { from: accounts[1] })
            await streamingElectricityMarketplace.buyProduct(productId, subscriptionSeconds, purchaseAmount, { from: accounts[1] })
        })

        // it("grant fails for non-owner", async () => {
        //     await assertFails(streamingElectricityMarketplace.grantSubscription(productId, 100, accounts[5], { from: accounts[5] }))
        // })

        it("grant works for owner", async () => {
            async function testGrant(_productId) {
                const subBefore = await streamingElectricityMarketplace.getSubscriptionTo(_productId, { from: accounts[5] })

                /// [Note]: grantSubscription() method can be called by product owner
                streamingElectricityMarketplace.grantSubscription(_productId, 100, accounts[5], { from: accounts[0] })
                
                const subAfter = await streamingElectricityMarketplace.getSubscriptionTo(_productId, { from: accounts[5] })
                assert(subAfter.isValid)

                /// [Note]: "100" below means "100 seconds" which is defined as the subscription period
                /// [Todo]: Need to create the advanced-time (more than 100 seconds) in order to do test below. (By using openzeppelin-test-helpers)
                //assert(subAfter.endTimestamp - subBefore.endTimestamp > 100 - testToleranceSeconds)
            }
            await testGrant(productId)
        })

        it("subscription can be extended (In case that subscrioption period is expired, an user pay subscrioption fees again in order to extend subscrioption period)", async () => {
            /// [Note]: This value from saved-amount of the Product struct (in the Marketplace.sol) when createProduct() above was executed
            /// [Note]: This assume that a user buy 100kw/month
            const pricePerSecond = monthlySubscriptionPlanPricePerSecond(electricPriceUSD);            
            const subscriptionSeconds = 2592000; /// [Note]: 1 month == 2592000 seconds
            let purchaseAmount = monthlySubscriptionPlan(pricePerSecond, subscriptionSeconds);

            async function testExtension(_productId) {
                const subBefore = await streamingElectricityMarketplace.getSubscriptionTo(_productId, { from: accounts[1] })
                assert(subBefore.isValid)

                await dataCoin.approve(STREAMING_ELECTRICITY_MARKETPLACE, purchaseAmount, { from: accounts[1] })
                await streamingElectricityMarketplace.buyProduct(_productId, subscriptionSeconds, purchaseAmount, { from: accounts[1] })

                const subAfter = await streamingElectricityMarketplace.getSubscriptionTo(_productId, { from: accounts[1] })
                assert(subAfter.isValid)

                /// [Note]: "100" below means "100 seconds" which is defined as the subscription period
                /// [Todo]: Need to create the advanced-time (more than 100 seconds) in order to do test below. (By using openzeppelin-test-helpers)
                //assert(subAfter.endTimestamp - subBefore.endTimestamp > 100 - testToleranceSeconds)
            }
            await testExtension(productId)
        })

    })

});
