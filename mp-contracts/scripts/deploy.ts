import {ethers} from "hardhat";

async function main() {
  const TheMarketplace = await ethers.getContractFactory("TheMarketplace");
  const marketplace = await TheMarketplace.deploy();
  console.log("TheMarketplace", marketplace.address);
}

main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
