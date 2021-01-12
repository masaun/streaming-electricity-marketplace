const StreamingElectricityMarketplace = artifacts.require("StreamingElectricityMarketplace");
const ElectricityPriceOracle = artifacts.require("ElectricityPriceOracle");
const Marketplace = artifacts.require("Marketplace");
const DataToken = artifacts.require("DataToken");

let _electricityPriceOracle = ElectricityPriceOracle.address;
let _marketplace = "Bring from mainnet";  /// [Todo]: Bring from mainnet
let _dataToken = DataToken.address;

module.exports = async function(deployer) {
    await deployer.deploy(StreamingElectricityMarketplace, _electricityPriceOracle, _marketplace, _dataToken);
};
