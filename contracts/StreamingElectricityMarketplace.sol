pragma solidity ^0.5.16;

/// Openzeppelin-solidity v2.5.0
import { ERC20 } from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";

/// Oracle
import { ElectricityPriceOracle } from "./ElectricityPriceOracle.sol";

/// Streamr
import { Marketplace } from "./streamr/Marketplace.sol";  /// [Note]: Include UniswapAdaptor.sol and BancorAdaptor.sol


/**
 * @notice - This is the StreamingElectricityMarketplace contract for M2M supscription payment of electricity.
 */
contract StreamingElectricityMarketplace {

    struct Device {  /// [Key]: Array index is currentDeviceId - 1
        address ownerAddress;
        address deviceAddress;
        uint sellPrice;  /// [Note]: Threshold of price for selling
        uint buyPrice;   /// [Note]: Threshold of price for buying 
    }
    Device[] devices;

    ElectricityPriceOracle public electricityPriceOracle;
    Marketplace public marketplace;
    ERC20 public dataToken;

    address MARKETPLACE;

    constructor(ElectricityPriceOracle _electricityPriceOracle, Marketplace _marketplace, address _dataToken) public {
        electricityPriceOracle = _electricityPriceOracle;
        marketplace = _marketplace;
        dataToken = ERC20(_dataToken);

        MARKETPLACE = address(_marketplace);
    }

    /// [Attention]: This smart contract does delegate execution on behalf of msg.sender
    function createProduct(bytes32 id, string memory name, address beneficiary, uint pricePerSecond, Currency currency, uint minimumSubscriptionSeconds) public returns (bool) {
        marketplace.createProduct(id, name, beneficiary, pricePerSecond, currency, minimumSubscriptionSeconds, false);
    }


    function buyProduct(bytes32 productId, uint purchaseAmount) public returns (bool) {
        /// [Note]: Should approve the DataTokens in advance
        dataToken.transferFrom(msg.sender, address(this), purchaseAmount);

        /// [Note]: approve this contract for the Marketplace contract
        dataToken.approve(MARKETPLACE, purchaseAmount);

        /// Buy for a product with the DataTokens 
        marketplace.buy(productId, purchaseAmount);
    }
    

    /////////////////////
    /// Getter methods
    /////////////////////
    function getSubscriptionTo(bytes32 productId, address subscriber) public view returns (bool isValid, uint endTimestamp) {
        return marketplace.getSubscriptionTo(productId, subscriber);
    }


}
