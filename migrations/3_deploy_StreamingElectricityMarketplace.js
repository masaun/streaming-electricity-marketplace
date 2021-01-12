const StreamingElectricityMarketplace = artifacts.require("StreamingElectricityMarketplace");

module.exports = async function(deployer) {
    await deployer.deploy(StreamingElectricityMarketplace);
};
