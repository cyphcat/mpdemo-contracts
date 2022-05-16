import {ethers, network} from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("deploying");

  const chainId = network.config.chainId || 31337;
  const baseURI = "https://cypx-mpdemo.herokuapp.com/tokens/";

  const TheCoin = await ethers.getContractFactory("TheCoin");
  const coin = await TheCoin.deploy();
  await coin.deployed();

  const TheNFT = await ethers.getContractFactory("TheNFT");
  const nft = await TheNFT.deploy(baseURI);
  await nft.deployed();

  const TheMarketplaceRegistry = await ethers.getContractFactory("TheMarketplaceRegistry");
  const registry = await TheMarketplaceRegistry.deploy();
  await registry.deployed();

  const TheMarketplace = await ethers.getContractFactory("TheMarketplace");
  const marketplace = await TheMarketplace.deploy(chainId, registry.address);
  await marketplace.deployed();

  const StaticMarket = await ethers.getContractFactory("StaticMarket");
  const staticMarket = await StaticMarket.deploy();
  await staticMarket.deployed();

  await registry.grantInitialAuthentication(marketplace.address);

  const addresses = {
    "TheCoin": coin.address,
    "TheNFT": nft.address,
    "TheMarketplaceRegistry": registry.address,
    "TheMarketplace": marketplace.address,
    "StaticMarket": staticMarket.address,
  };
  console.log(chainId, addresses);

  const artifactsDir = path.resolve(__dirname, "../artifacts");
  const exportDir = path.resolve(process.env.FRONTEND_PROJECT_DIR!, "src/contracts");
  if (fs.existsSync(exportDir)) {
    fs.writeFileSync(
      path.resolve(exportDir, "deployments", chainId + ".json"),
      JSON.stringify(addresses), "utf-8");
    fs.copyFileSync(
      path.resolve(artifactsDir, "contracts/TheCoin.sol/TheCoin.json"),
      path.resolve(exportDir, "artifacts/TheCoin.json"));
    fs.copyFileSync(
      path.resolve(artifactsDir, "contracts/TheNFT.sol/TheNFT.json"),
      path.resolve(exportDir, "artifacts/TheNFT.json"));
    fs.copyFileSync(
      path.resolve(artifactsDir, "contracts/TheMarketplaceRegistry.sol/TheMarketplaceRegistry.json"),
      path.resolve(exportDir, "artifacts/TheMarketplaceRegistry.json"));
    fs.copyFileSync(
      path.resolve(artifactsDir, "contracts/TheMarketplace.sol/TheMarketplace.json"),
      path.resolve(exportDir, "artifacts/TheMarketplace.json"));
    fs.copyFileSync(
      path.resolve(artifactsDir, "wyvern-v3/contracts/StaticMarket.sol/StaticMarket.json"),
      path.resolve(exportDir, "artifacts/StaticMarket.json"));
    fs.copyFileSync(
      path.resolve(artifactsDir, "@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json"),
      path.resolve(exportDir, "artifacts/IERC20.json"));
    fs.copyFileSync(
      path.resolve(artifactsDir, "@openzeppelin/contracts/token/ERC721/IERC721.sol/IERC721.json"),
      path.resolve(exportDir, "artifacts/IERC721.json"));
    fs.copyFileSync(
      path.resolve(artifactsDir, "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol/IERC721Metadata.json"),
      path.resolve(exportDir, "artifacts/IERC721Metadata.json"));
    console.log("exported");
  }
}

main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
