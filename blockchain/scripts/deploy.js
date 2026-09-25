const hre = require("hardhat");

async function main() {
  console.log("⚡ Deploying BlockFind AssetTracker smart contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const AssetTracker = await hre.ethers.getContractFactory("AssetTracker");
  const assetTracker = await AssetTracker.deploy();

  await assetTracker.waitForDeployment();
  const contractAddress = await assetTracker.getAddress();

  console.log("====================================================");
  console.log("🎉 AssetTracker deployed successfully!");
  console.log("📜 Contract Address:", contractAddress);
  console.log("====================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
