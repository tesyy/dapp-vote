require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.5.15",
  networks: {
    hardhat: {
      // Configuration for the local Hardhat Network
    },
    // Example for Sepolia testnet - uncomment and fill in details if you plan to deploy
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "", // Use environment variable
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [], // Use environment variable
    }
  }
}; 