pragma solidity ^0.5.16;

/// Openzeppelin-solidity v2.5.0
import { ERC20 } from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";

/// Oracle
import { ElectricityPriceOracle } from "./ElectricityPriceOracle.sol";

/// Streamr
import { Marketplace } from "./streamr/Marketplace.sol";  /// [Note]: Include UniswapAdaptor.sol and BancorAdaptor.sol
import { DataCoin } from "./DataCoin.sol";


/**
 * @notice - This is the StreamingElectricityMarketplace contract for M2M supscription payment of electricity.
 */
contract StreamingElectricityMarketplace is Marketplace {

    struct Device {  /// [Key]: Array index is currentDeviceId - 1
        address ownerAddress;
        address deviceAddress;
        uint sellPrice;  /// [Note]: Threshold of price for selling
        uint buyPrice;   /// [Note]: Threshold of price for buying 
    }
    Device[] devices;

    ElectricityPriceOracle public electricityPriceOracle;
    //Marketplace public marketplace;
    DataCoin public dataCoin;

    address MARKETPLACE;

    //constructor(ElectricityPriceOracle _electricityPriceOracle, Marketplace _marketplace, DataCoin _dataCoin) public {
    constructor(
        ElectricityPriceOracle _electricityPriceOracle, 
        address _dataCoin,
        address currencyUpdateAgentAddress,
        address prev_marketplace_address
    ) public Marketplace(_dataCoin, currencyUpdateAgentAddress, prev_marketplace_address) {
        electricityPriceOracle = _electricityPriceOracle;
        //marketplace = _marketplace;
        dataCoin = DataCoin(_dataCoin);

        //MARKETPLACE = address(_marketplace);
    }


    ///------------------------------------------------------------------------------------
    /// [Attention]: This smart contract conduct delegate executions on behalf of msg.sender
    ///------------------------------------------------------------------------------------

    /**
     * @notice - Launch electricity-based product 
     * @dev - ProductId = 1:Solar Power, 2:Hydro Power, etc...
     */
    function createProduct(bytes32 id, string memory name, address beneficiary, uint pricePerSecond, Marketplace.Currency currency, uint minimumSubscriptionSeconds) public returns (bool) {
        createProduct(id, name, beneficiary, pricePerSecond, currency, minimumSubscriptionSeconds);
        //marketplace.createProduct(id, name, beneficiary, pricePerSecond, currency, minimumSubscriptionSeconds);
    }

    /**
     * @notice - Buy and start a subscription payment for electricity
     */
    function buyProduct(bytes32 productId, uint subscriptionSeconds, uint purchaseAmount) public returns (bool) {
        /// [Note]: Should approve the DataCoins in advance
        dataCoin.transferFrom(msg.sender, address(this), purchaseAmount);

        /// [Note]: approve this contract for the Marketplace contract
        dataCoin.approve(MARKETPLACE, purchaseAmount);

        /// Buy for a product with the DataCoins
        buy(productId, subscriptionSeconds);
        //marketplace.buy(productId, subscriptionSeconds);
    }

    /**
     * @notice - Grant subscription
     */
    function grantSubscription(bytes32 productId, uint subscriptionSeconds, address recipient) public returns (bool) {
        grantSubscription(productId, subscriptionSeconds, recipient);
        //marketplace.grantSubscription(productId, subscriptionSeconds, recipient);
    }
    

    /////////////////////
    /// Getter methods
    /////////////////////

    /**
     * @notice - this method is in order to get end-timestamp of subscription of caller (msg.sender)
     */
    function getSubscriptionTo(bytes32 productId) public view returns (bool isValid, uint endTimestamp) {
        return getSubscriptionTo(productId);
        //return marketplace.getSubscriptionTo(productId);
    }


}
