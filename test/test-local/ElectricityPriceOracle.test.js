/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

/// Helper for getting Events of Provable-Things
const { waitForEvent } = require('../utils/provable-things/getEventsHelper.js');

/// Artifact of the ElectricityPriceOracle.test contract 
const ElectricityPriceOracle = artifacts.require("ElectricityPriceOracle");


/***
 * @dev - Execution COMMAND: $ truffle test ./test/test-local/ElectricityPriceOracle.test.js
 **/
contract("ElectricityPriceOracle", function(accounts) {
    /// Global ElectricityPriceOracle contract instance
    let electricityPriceOracle;

    /// Global variable for testing of listening events
    let energyPrice;
    let queriedPrice;

    describe("Setup smart-contracts", () => {
        it("Check all accounts", async () => {
            console.log('=== accounts ===\n', accounts);
        });        

        it("Setup the ElectricityPriceOracle contract instance", async () => {
            /// [Note]: Transfer 1 ETH
            electricityPriceOracle = await ElectricityPriceOracle.new({ from: accounts[0], value: web3.utils.toWei("1", "ether") });
        });
    });

    describe("Listening events and retrieve a current Energy Price", () => {
        it('Should get contract instantiation for listening to events', async () => {
            /// Using deployed contract
            const { contract } = await electricityPriceOracle;

            /// Using websocket
            const { methods, events } = new web3.eth.Contract(
                contract._jsonInterface,
                contract._address
            )

            /// [Log]
            console.log('\n=== events ===', events);

        })

        it('Callback should have logged a new Energy Price', async () => {
            /// Using deployed contract
            const { contract } = await electricityPriceOracle;

            /// Using websocket
            const { methods, events } = new web3.eth.Contract(
                contract._jsonInterface,
                contract._address
            )

            /// Retrieve the returned value of NewPrice Event
            const {
                returnValues: {  /// [Note]: "what", "price", "id" are parameters of the NewPrice Event in ElectricityPriceOracle.sol
                    what, 
                    price, 
                    id
                }
            } = await waitForEvent(events.NewPrice);

            energyPrice = price * 100;
            console.log('\n=== energyPrice ===', parseInt(energyPrice));  /// [Result]: 13 (the average price of electricity in the world)
        })

        it('Should set Energy Price correctly in contract', async () => {
            /// Using deployed contract
            const { contract } = await electricityPriceOracle;

            /// Using websocket
            const { methods, events } = new web3.eth.Contract(
                contract._jsonInterface,
                contract._address
            )

            /// Check queriedPrice
            queriedPrice = await methods
                .electricPriceUSD()  /// [Note]: "electricPriceUSD" is the global variable defined in the ElectricityPriceOracle.sol
                .call()

            console.log('\n=== queriedPrice ===', parseInt(queriedPrice)); /// [Result]: 13

            assert.strictEqual(
                parseInt(energyPrice),
                parseInt(queriedPrice),
                'Contract\'s Energy Price not set correctly!'
            )
        })
    });

    describe("Retrieve an electricity price", () => {
        /// check that it sends a query and receives a response
        it('sends an electricity price query and receives a response', async function () {

            /// set this test to timeout after 1 minute
            this.timeout(60 * 1000)

            /// call the getRandomNumber function
            /// make sure to send enough Ether and to set gas limit sufficiently high
            const result = await electricityPriceOracle.updateElectric({
                from: accounts[0],
                value: web3.utils.toWei('1', 'ether'),
                gas: '5000000',
            })

            ///-------------------------------------------------------------------
            /// Method 1 to check for events: loop through the "result" variable
            ///-------------------------------------------------------------------

            // look for the NewOraclizeQuery event to make sure query sent
            let testPassed = false // variable to hold status of result
            for (let i = 0; i < result.logs.length; i++) {
                let log = result.logs[i]
                if (log.event === 'NewOraclizeQuery') {
                    testPassed = true
                }
            }
            assert(testPassed, '"NewOraclizeQuery" event not found')


            ///------------------------------------------------
            /// Method 2 to check for events: listen for them
            ///------------------------------------------------

            /// listen for LogResultReceived event to check for Oraclize's call to _callback
            /// define events we want to listen for
            
            /// Using deployed contract
            const { contract } = await electricityPriceOracle;

            /// Using websocket
            const { methods, events } = new web3.eth.Contract(
                contract._jsonInterface,
                contract._address
            )

            /// Retrieve the returned value of NewPrice Event
            const {
                returnValues: {  /// [Note]: "what", "price", "id" are parameters of the NewPrice Event in ElectricityPriceOracle.sol
                    what, 
                    price, 
                    id
                }
            } = await waitForEvent(events.NewPrice);

            const electricPriceUSD = price * 100;
            console.log('\n=== electricPriceUSD ===', electricPriceUSD);  /// [Result]: 13 

            /// ensure result is within our query's min/max values
            assert.notEqual(electricPriceUSD, 0, 'Electricity price was zero.')
        });
    });

});
