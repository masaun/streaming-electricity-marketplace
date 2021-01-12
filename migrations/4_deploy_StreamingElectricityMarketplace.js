const StreamingElectricityMarketplace = artifacts.require("StreamingElectricityMarketplace");
const ElectricityPriceOracle = artifacts.require("ElectricityPriceOracle");
const Marketplace = artifacts.require("Marketplace");
const DataToken = artifacts.require("DataToken");

/// [Note]: Mainnet address https://github.com/streamr-dev/marketplace-contracts/blob/master/migrations/2_deploy_contracts.js#L10 
let _electricityPriceOracle = ElectricityPriceOracle.address;
let _marketplace = "0xa10151d088f6f2705a05d6c83719e99e079a61c1";  /// [Todo]: Bring from mainnet
let _dataToken = "0x0Cf0Ee63788A0849fE5297F3407f701E122cC023";    /// [Note]: Bring contract address from mainnet
//let _dataToken = DataToken.address;

module.exports = async function(deployer) {
    await deployer.deploy(StreamingElectricityMarketplace, _electricityPriceOracle, _marketplace, _dataToken);
};
