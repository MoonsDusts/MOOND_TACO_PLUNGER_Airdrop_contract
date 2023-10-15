import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import tacon from "../args/taconHolder";
import plunger from "../args/plungerHolder";

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployAirdrop() {
    const [owner, ...otherAccounts] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('MockToken');
    const token = await Token.deploy();

    const Airdrop = await ethers.getContractFactory("Airdrop");

    const airdrop = await Airdrop.deploy(token.target);

    return { airdrop, token, owner, otherAccounts };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { airdrop, otherAccounts, token, owner } = await loadFixture(deployAirdrop);

      const taconSupply = tacon.reduce((prev, cur) => prev + ethers.parseEther(cur.balance), 0n);

      console.log(ethers.formatEther(taconSupply))

      const TACON_AMOUNT = ethers.parseEther('5000');

      await (await airdrop.setTaconAirdrop(tacon.map(item => ({ to: item.address, amount: ethers.parseEther(item.balance), airdropAmount: TACON_AMOUNT * ethers.parseEther(item.balance) / taconSupply })))).wait()

      console.log(await airdrop.airdrops('0x00f33fd847d48ac64f6f8f3ff577264da59fe882'))




      const plungerSupply = plunger.reduce((prev, cur) => prev + ethers.parseEther(cur.balance), 0n);

      const PLUNGER_AMOUNT = ethers.parseEther('10000');

      console.log(ethers.formatEther(plungerSupply))

      await (await airdrop.setPlungerAirdrop(plunger.map(item => ({ to: item.address, amount: ethers.parseEther(item.balance), airdropAmount: PLUNGER_AMOUNT * ethers.parseEther(item.balance) / plungerSupply })))).wait()

      console.log(await airdrop.airdrops('0x00f33fd847d48ac64f6f8f3ff577264da59fe882'))

      const user = await ethers.getImpersonatedSigner('0x00f33fd847d48ac64f6f8f3ff577264da59fe882')

      await (await token.approve(airdrop.target, ethers.parseEther('15000'))).wait()
      await (await airdrop.startAirdrop()).wait()

      await owner.sendTransaction({
        value: ethers.parseEther('1000'), to: user.address
      })
      await (await airdrop.connect(user).airdrop()).wait()

      console.log(await token.balanceOf(user.address))
      console.log(await airdrop.airdrops('0x00f33fd847d48ac64f6f8f3ff577264da59fe882'))
    });
  });
});
