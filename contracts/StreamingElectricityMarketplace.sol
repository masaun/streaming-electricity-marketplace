pragma solidity ^0.5.16;


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

    constructor() public {}

}
