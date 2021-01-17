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


    describe("Setup smart-contracts", () => {
        it("Check all accounts", async () => {
            console.log('=== accounts ===\n', accounts);
        });        

        it("Setup the ElectricityPriceOracle contract instance", async () => {
            /// [Note]: Transfer 1 ETH
            electricityPriceOracle = await ElectricityPriceOracle.new({ from: accounts[0], value: web3.utils.toWei("1", "ether") });
        });
    });

    describe("Listening events", () => {
        it('Should get contract instantiation for listening to events', async () => {
            /// Using deployed contract
            //const { contract } = await ElectricityPriceOracle.deployed();
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
            const {
                returnValues: {
                    newEnergyPrice
                }
            } = await waitForEvent(events.NewPrice);

            energyPrice = newEnergyPrice * 100;
            console.log('\n=== energyPrice ===', parseInt(energyPrice));
        })

        it('Should set Energy Price correctly in contract', async () => {
            const queriedPrice = await methods
                .electricPriceUSD()
                .call()

            console.log('\n=== queriedPrice ===', parseInt(queriedPrice));

            assert.strictEqual(
                parseInt(contractPrice),
                parseInt(queriedPrice),
                'Contract\'s Energy Price not set correctly!'
            )
        })
    });

    describe("Retrieve an electricity price", () => {
        // check that it sends a query and receives a response
        it('sends an electricity price query and receives a response', async function () {

            // set this test to timeout after 1 minute
            this.timeout(60 * 1000)

            // call the getRandomNumber function
            // make sure to send enough Ether and to set gas limit sufficiently high
            const result = await electricityPriceOracle.updateElectric({
                from: accounts[0],
                value: web3.utils.toWei('1', 'ether'),
                gas: '5000000',
            })
            console.log('\n=== result ===', result);


            ///------------------------------------------------------------
            /// [Test]: By using waitForEvent() from the Provable-Things
            ///------------------------------------------------------------
            const {
                returnValues: {
                    _newEnergyPrice
                }
            } = await waitForEvent(contractEvents.NewPrice)
            newEnergyPriceFromContractEvent = _newEnergyPrice
            console.log('\n=== newEnergyPriceFromContractEvent ===', newEnergyPriceFromContractEvent);






            // Method 1 to check for events: loop through the "result" variable

            // look for the NewOraclizeQuery event to make sure query sent
            let testPassed = false // variable to hold status of result
            for (let i = 0; i < result.logs.length; i++) {
                let log = result.logs[i]
                if (log.event === 'NewOraclizeQuery') {
                    testPassed = true
                }
            }
            assert(testPassed, '"NewOraclizeQuery" event not found')


            ///---------------------------
            /// [Test]: web3.js v1.0.0
            ///---------------------------
            electricityPriceOracle.events.NewPrice({
                fromBlock: 'latest',
                toBlock: 'latest'
            }, function(error, result) {
                if (!error) {
                    console.log('\n=== result ([Test]: web3.js v1.0.0) ===', result);
                } else {
                    console.log('\n=== error ([Test]: web3.js v1.0.0) ===', error);
                }
            });


            ///---------------------------
            /// Original Code 
            ///---------------------------

            // Method 2 to check for events: listen for them with .watch()

            // listen for LogResultReceived event to check for Oraclize's call to _callback
            // define events we want to listen for
            const NewPrice = electricityPriceOracle.events.NewPrice()  /// [Note]: web3.js v1.0.0
            //const NewPrice = electricityPriceOracle.NewPrice()       /// [Note]: web3.js v0.2.0

            // create promise so Mocha waits for value to be returned
            let checkForNumber = new Promise((resolve, reject) => {
                // watch for our LogResultReceived event
                electricityPriceOracle.events.NewPrice(async function(error, result) {  /// [Note]: web3.js v1.0.0
                //NewPrice.watch(async function (error, result) {                       /// [Note]: web3.js v0.2.0
                    if (error) {
                      reject(error)
                    }

                    // template.randomNumber() returns a BigNumber object
                    const bigNumber = await electricityPriceOracle.electricPriceUSD.call()

                    // convert BigNumber to ordinary number
                    const electricPriceUSD = bigNumber.toNumber()
                    
                    // stop watching event and resolve promise
                    //NewPrice.stopWatching()
                    resolve(electricPriceUSD)
                }) // end LogResultReceived.watch()
            }) // end new Promise

            // call promise and wait for result
            const electricPriceUSD = await checkForNumber
            console.log('\n=== electricPriceUSD ===', electricPriceUSD);

            // ensure result is within our query's min/max values
            assert.notEqual(electricPriceUSD, 0, 'Electricity price was zero.')
        });
    });

});
