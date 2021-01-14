const StreamingElectricityMarketplace = artifacts.require("StreamingElectricityMarketplace");
const ElectricityPriceOracle = artifacts.require("ElectricityPriceOracle");
const Marketplace = artifacts.require("Marketplace");
const DataCoin = artifacts.require("DataCoin");

/// [Note]: Mainnet address https://github.com/streamr-dev/marketplace-contracts/blob/master/migrations/2_deploy_contracts.js#L10 
let _electricityPriceOracle = ElectricityPriceOracle.address;
let _marketplace = "0xa10151d088f6f2705a05d6c83719e99e079a61c1";  /// [Todo]: Bring from mainnet
let _dataCoin = "0x0Cf0Ee63788A0849fE5297F3407f701E122cC023";    /// [Note]: Bring contract address from mainnet
//let _dataCoin = DataCoin.address;
let currencyUpdateAgentAddress = "0xCC23517BC2CeB8441E5C5ea3160Eaa2E725b305d";  /// [Note]: Dummy contract address
let prev_marketplace_address = "0xF83a5EB85302EcFA0103e89dEc2593f607ceDE99";    /// [Note]: Dummy contract address

module.exports = async function(deployer) {
    //await deployer.deploy(StreamingElectricityMarketplace, _electricityPriceOracle, _marketplace, _dataCoin);
    await deployer.deploy(StreamingElectricityMarketplace, _electricityPriceOracle, _dataCoin, currencyUpdateAgentAddress, prev_marketplace_address);
};
