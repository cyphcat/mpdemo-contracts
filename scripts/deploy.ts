import {ethers, network} from "hardhat";

async function main() {

  const TheCoin = await ethers.getContractFactory("TheCoin");
  const coin = await TheCoin.deploy();
  await coin.deployed();
  console.log("TheCoin", coin.address);

  const TheNFT = await ethers.getContractFactory("TheNFT");
  const nft = await TheNFT.deploy();
  await nft.deployed();
  console.log("TheNFT", nft.address);

  const StaticMarket = await ethers.getContractFactory("StaticMarket");
  const staticMarket = await StaticMarket.deploy();
  await staticMarket.deployed();
  console.log("StaticMarket", staticMarket.address);

  const TheMarketplaceRegistry = await ethers.getContractFactory("TheMarketplaceRegistry");
  const registry = await TheMarketplaceRegistry.deploy();
  await registry.deployed();
  console.log("TheMarketplaceRegistry", registry.address);

  const TheMarketplace = await ethers.getContractFactory("TheMarketplace");
  const marketplace = await TheMarketplace.deploy(network.config.chainId!, registry.address);
  await marketplace.deployed();
  console.log("TheMarketplace", marketplace.address);

  await registry.grantInitialAuthentication(marketplace.address);
}

main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
