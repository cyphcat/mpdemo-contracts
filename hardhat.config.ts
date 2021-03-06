import * as dotenv from "dotenv";
import {HardhatUserConfig} from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {enabled: true, runs: 200}
        }
      },
      {
        version: "0.7.5",
        settings: {
          optimizer: {enabled: true, runs: 200}
        }
      }
    ]
  },
  networks: {
    ropsten: {
      chainId: 3,
      url: "https://ropsten.infura.io/v3/c1f4805e86154bab916a1a716f17489c",
      accounts: [process.env.ROPSTEN_PRIVATE_KEY || ""],
    }
  }
};

export default config;
