const ElectricityPriceOracle = artifacts.require("ElectricityPriceOracle");

module.exports = async function(deployer) {
    await deployer.deploy(ElectricityPriceOracle);
};
