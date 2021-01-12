const DataCoin = artifacts.require("DataCoin");

module.exports = async function(deployer) {
    await deployer.deploy(DataCoin);
};
