import {ethers, network} from "hardhat";
import {
  AuthenticatedProxy__factory,
  StaticMarket,
  TheCoin,
  TheMarketplace,
  TheMarketplaceRegistry,
  TheNFT
} from "../typechain";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import * as util from "./util";
import {Order} from "../lib/Order";
import {Call, HowToCall} from "../lib/Call";
import {expect} from "chai";
import {formatBytes32String, Interface, parseUnits} from "ethers/lib/utils";

const ONE_WEEK = 7 * 24 * 60 * 60;
const CHAIN_ID = network.config.chainId!;

const abi = Interface.getAbiCoder();

describe("TheMarketplace", () => {

  let coin: TheCoin;
  let nft: TheNFT;
  let registry: TheMarketplaceRegistry;
  let marketplace: TheMarketplace;
  let staticMarket: StaticMarket;

  let AuthenticatedProxy: AuthenticatedProxy__factory;

  let [deployer, alice, bob]: SignerWithAddress[] = [];

  let eip712Domain: object;

  async function deployContracts() {
    const TheCoin = await ethers.getContractFactory("TheCoin");
    coin = await TheCoin.deploy();
    const TheNFT = await ethers.getContractFactory("TheNFT");
    nft = await TheNFT.deploy("http://localhost:8080/tokens/");
    const TheMarketplaceRegistry = await ethers.getContractFactory("TheMarketplaceRegistry");
    registry = await TheMarketplaceRegistry.deploy();
    const TheMarketplace = await ethers.getContractFactory("TheMarketplace");
    marketplace = await TheMarketplace.deploy(CHAIN_ID, registry.address);
    const StaticMarket = await ethers.getContractFactory("StaticMarket");
    staticMarket = await StaticMarket.deploy();
  }

  beforeEach(async () => {
    [deployer, alice, bob] = await ethers.getSigners();

    await deployContracts();
    await registry.grantInitialAuthentication(marketplace.address);

    AuthenticatedProxy = await ethers.getContractFactory("AuthenticatedProxy");

    eip712Domain = {
      name: "The Marketplace",
      version: "1.0",
      chainId: CHAIN_ID,
      verifyingContract: marketplace.address,
    };
  });

  it("can match order", async () => {
    const now = Math.floor(Date.now() / 1000);

    // alice mints some nfts
    await nft.connect(alice).mint(2);
    expect(await nft.ownerOf(0)).to.equal(alice.address);
    expect(await nft.ownerOf(1)).to.equal(alice.address);

    // alice registers proxy
    await registry.connect(alice).registerProxy();
    const aliceProxy = AuthenticatedProxy.attach(await registry.proxies(alice.address));
    expect(await aliceProxy.user()).to.equal(alice.address);

    // alice approves the proxy to transfer her nfts
    await nft.connect(alice).setApprovalForAll(aliceProxy.address, true);
    expect(await nft.isApprovedForAll(alice.address, aliceProxy.address)).to.equal(true);

    // bob mints some coins
    await coin.connect(bob).mint(parseUnits("10"));
    expect(await coin.balanceOf(bob.address)).to.equal(parseUnits("10"));

    // bob registers proxy
    await registry.connect(bob).registerProxy();
    const bobProxy = AuthenticatedProxy.attach(await registry.proxies(bob.address));
    expect(await bobProxy.user()).to.equal(bob.address);

    // bob approves the proxy to transfer his coins
    await coin.connect(bob).approve(bobProxy.address, parseUnits("10"));
    expect(await coin.allowance(bob.address, bobProxy.address)).to.equal(parseUnits("10"));


    // alice wants to sell her nft for coins
    const tokenId = 1;
    const price = parseUnits("2.5");

    // alice creates a sell order
    const sellOrder: Order = {
      registry: registry.address,
      maker: alice.address,
      staticTarget: staticMarket.address,
      staticSelector: Interface.getSighash(
        staticMarket.interface.functions["ERC721ForERC20(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"]),
      staticExtradata: abi.encode(
        ["address[2]", "uint256[2]"],
        [[nft.address, coin.address], [tokenId, price]]),
      maximumFill: 1,
      listingTime: now,
      expirationTime: now + ONE_WEEK,
      salt: util.generateSalt(),
    };

    // alice signs the sell order
    const sellSig = await util.signOrder(alice, sellOrder, marketplace);


    // bob found the sell order and wants to buy the nft with his coins

    // bob creates a buy order
    const buyOrder: Order = {
      registry: registry.address,
      maker: bob.address,
      staticTarget: staticMarket.address,
      staticSelector: Interface.getSighash(
        staticMarket.interface.functions["ERC20ForERC721(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"]),
      staticExtradata: abi.encode(
        ["address[2]", "uint256[2]"],
        [[coin.address, nft.address], [tokenId, price]]),
      maximumFill: 1,
      listingTime: now,
      expirationTime: now + ONE_WEEK,
      salt: util.generateSalt(),
    };

    // bob signs the buy order
    const buySig = await util.signOrder(bob, buyOrder, marketplace);

    // bob matches his buy order with alice's sell order
    const sellCall: Call = {
      target: nft.address,
      howToCall: HowToCall.Call,
      data: nft.interface.encodeFunctionData("transferFrom", [alice.address, bob.address, tokenId])
    };
    const buyCall: Call = {
      target: coin.address,
      howToCall: HowToCall.Call,
      data: coin.interface.encodeFunctionData("transferFrom", [bob.address, alice.address, price])
    };
    const args = util.atomicMatchArgs(sellOrder, sellCall, sellSig, buyOrder, buyCall, buySig, formatBytes32String(""));
    await marketplace.connect(bob).atomicMatch_.apply(null, args);

    // bob now owns the nft
    expect(await nft.ownerOf(tokenId)).to.equal(bob.address);

    // alice should receive the coins
    expect(await coin.balanceOf(alice.address)).to.equal(price);
  });
});
