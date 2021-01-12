const DataToken = artifacts.require("DataToken");

module.exports = async function(deployer) {
    await deployer.deploy(DataToken);
};
