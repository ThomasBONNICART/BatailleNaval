const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { Contract } = require("hardhat/internal/hardhat-network/stack-traces/model");

async function deploy() {

  // Contracts are deployed using the first signer/account by default
  const [owner, otherAccount] = await ethers.getSigners();

  // console.log("message:", await testContract.getMessage())

  const TestContract = await hre.ethers.getContractFactory("TestContract");
  const testContract = await TestContract.deploy("contrat de test!");
  await testContract.deployed();

  return { testContract, owner, otherAccount };
}

describe("TestContract", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { testContract } = await loadFixture(deploy);

      expect(await testContract.getMessage()).to.equal("contrat de test!");
    });
  });

  describe("Execution", function () {
    it("must change message", async function () {
      const { testContract } = await loadFixture(deploy);
      // await testContract.setMessage("message changed!")
      // expect(await testContract.getMessage()).to.equal("message changed!");
    });
  });
});

describe("Events", function () {
  it("Should emit an event on withdrawals", async function () {
    const { testContract } = await loadFixture(deploy);
    // let evt = { isTriggered: false }
    testContract.on("MessageChanged", (e) => {
      expect(e).to.be.a("String")
      expect(e).to.equal("trigger event!")
      // evt.isTriggered = true
    })
    await testContract.setMessage("trigger event!")
    // await wait(evt, 'isTriggered')
  });
});

async function wait(obj, cond) {
  return new Promise((res) => {
    let id = -1
    id = setInterval(() => {
      if (obj[cond]) {
        clearInterval(id)
        res(null)
        return
      }
    }, 100)
  })
}