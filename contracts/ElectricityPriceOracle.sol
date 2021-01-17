pragma solidity ^0.5.16;

import "./provable-things/oraclizeAPI_0.5.sol";


/**
 * @notice - This is the ElectricityPriceOracle contract for providing electricity price feed via oracle.
 * @notice - Electricity price this time is just assumption.
    
    Energy Price Peg
    This contract keeps in storage a reference
    to the Energy Price in USD
 */
contract ElectricityPriceOracle is usingOraclize {

    enum Query {
        INVALID,
        ELECTRIC
    }

    uint public electricPriceUSD;

    mapping(bytes32 => Query) validIds;

    event NewOraclizeQuery(string what, bytes32 id);
    event UpdateInvoke(address sender);
    event NewPrice(string what, string price, bytes32 id);


    constructor() public payable {
        // send some Ethers with the deployment!

        // this line is given by the ethereum-bridge
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);  /// [Note]: This address must be changed every execution of ethereum-bridge

        // first check at contract creation
        updateElectric();
    }

    /**
     * @dev - NewPrice is retrieved via the event of "NewPrice"
     */
    function __callback(bytes32 myid, string memory result) public {
        emit UpdateInvoke(msg.sender);
        if (msg.sender != oraclize_cbAddress()) revert();
        
        electricPriceUSD = parseInt(result, 2); // let's save it as $ cents
        emit NewPrice("Electric", result, myid);

        // if (validIds[myid] == Query.ELECTRIC) {
        //     electricPriceUSD = parseInt(result, 2); // let's save it as $ cents
        //     emit NewPrice("Electric", result, myid);
        // } else {
        //     // validIds[myid] == Query.INVALID
        //     revert();
        // }

        // This query id is invalidated 
        validIds[myid] = Query.INVALID;
    }

    function updateElectric() public payable {
        bytes32 queryId = oraclize_query("URL", "xml(https://www.fueleconomy.gov/ws/rest/fuelprices).fuelPrices.electric");
        // add query ID to mapping
        validIds[queryId] = Query.ELECTRIC;
        emit NewOraclizeQuery("Electric", queryId);
    }

}
