import {Order} from "../lib/Order";
import {Call} from "../lib/Call";
import {BigNumber, BytesLike, Contract, Signature} from "ethers";
import {Interface} from "ethers/lib/utils";
import {ethers, network} from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";

export function atomicMatchArgs(firstOrder: Order, firstCall: Call, firstSig: Signature,
                                secondOrder: Order, secondCall: Call, secondSig: Signature,
                                metadata: BytesLike): any {
  const abi = Interface.getAbiCoder();
  const uints = [
    BigNumber.from(firstOrder.registry), BigNumber.from(firstOrder.maker), BigNumber.from(firstOrder.staticTarget),
    firstOrder.maximumFill, firstOrder.listingTime, firstOrder.expirationTime, firstOrder.salt,
    BigNumber.from(firstCall.target),
    BigNumber.from(secondOrder.registry), BigNumber.from(secondOrder.maker), BigNumber.from(secondOrder.staticTarget),
    secondOrder.maximumFill, secondOrder.listingTime, secondOrder.expirationTime, secondOrder.salt,
    BigNumber.from(secondCall.target),
  ];
  const staticSelectors = [firstOrder.staticSelector, secondOrder.staticSelector];
  const howToCalls = [firstCall.howToCall, secondCall.howToCall];
  const signatures = abi.encode(["bytes", "bytes"], [
    abi.encode(["uint8", "bytes32", "bytes32"], [firstSig.v, firstSig.r, firstSig.s]),
    abi.encode(["uint8", "bytes32", "bytes32"], [secondSig.v, secondSig.r, secondSig.s]),
  ]);
  return [
    uints, staticSelectors,
    firstOrder.staticExtradata, firstCall.data, secondOrder.staticExtradata, secondCall.data,
    howToCalls, metadata, signatures
  ];
}

export function generateSalt(): BigNumber {
  return BigNumber.from(ethers.utils.randomBytes(32));
}

export async function signOrder(signer: SignerWithAddress, order: Order, marketplace: Contract): Promise<Signature> {
  const sig = await signer._signTypedData(
    {...EIP712_DOMAIN, verifyingContract: marketplace.address}, EIP712_TYPES, order);
  return ethers.utils.splitSignature(sig);
}

const EIP712_DOMAIN = {
  name: "The Marketplace",
  version: "1.0",
  chainId: network.config.chainId!,
  verifyingContract: undefined,
};

const EIP712_TYPES = {
  Order: [
    {name: "registry", type: "address"},
    {name: "maker", type: "address"},
    {name: "staticTarget", type: "address"},
    {name: "staticSelector", type: "bytes4"},
    {name: "staticExtradata", type: "bytes"},
    {name: "maximumFill", type: "uint256"},
    {name: "listingTime", type: "uint256"},
    {name: "expirationTime", type: "uint256"},
    {name: "salt", type: "uint256"},
  ],
};
