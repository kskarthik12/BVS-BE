require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

console.log('API_URL:', process.env.API_URL);
console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY);

module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.API_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};