import {ethers} from "hardhat";
import {TheMarketplace} from "../typechain";
import {expect} from "chai";

describe("TheMarketplace", () => {

  let marketplace: TheMarketplace;

  beforeEach(async () => {
    const TheMarketplace = await ethers.getContractFactory("TheMarketplace");
    marketplace = await TheMarketplace.deploy();
  });

  it("test", async () => {
    expect(await ethers.provider.getBalance(marketplace.address)).to.equal(0);
  });
});
