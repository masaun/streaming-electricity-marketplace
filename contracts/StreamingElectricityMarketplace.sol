pragma solidity ^0.5.16;

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

    constructor(ElectricityPriceOracle _electricityPriceOracle, Marketplace _marketplace) public {
        electricityPriceOracle = _electricityPriceOracle;
        marketplace = _marketplace;
    }

}
