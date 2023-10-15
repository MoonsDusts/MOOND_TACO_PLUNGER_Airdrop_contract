import { ethers } from "hardhat";

import tacon from "../args/taconHolder";
import plunger from "../args/plungerHolder";

async function main() {
  const airdrop = await ethers.deployContract("Airdrop", ['0x4b2576BC44310D6dfb4cfCf2630f25190fc60803']);

  await airdrop.waitForDeployment();

  console.log(
    `Airdrop: `, airdrop.target
  );

  const taconSupply = tacon.reduce((prev, cur) => prev + ethers.parseEther(cur.balance), 0n);

  const TACON_AMOUNT = ethers.parseEther('5000');

  const taconData = tacon.map(item => ({ to: item.address, amount: ethers.parseEther(item.balance), airdropAmount: TACON_AMOUNT * ethers.parseEther(item.balance) / taconSupply }))

  await (await airdrop.setTaconAirdrop(taconData.slice(0, 180))).wait()
  await (await airdrop.setTaconAirdrop(taconData.slice(180))).wait()


  const plungerSupply = plunger.reduce((prev, cur) => prev + ethers.parseEther(cur.balance), 0n);

  const PLUNGER_AMOUNT = ethers.parseEther('10000');

  const plungerData = plunger.map(item => ({ to: item.address, amount: ethers.parseEther(item.balance), airdropAmount: PLUNGER_AMOUNT * ethers.parseEther(item.balance) / plungerSupply }))

  await (await airdrop.setPlungerAirdrop(plungerData.slice(0, 180))).wait()
  await (await airdrop.setPlungerAirdrop(plungerData.slice(180))).wait()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
