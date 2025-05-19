const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying DecentralizedVoting contract for Club President Election...");

  // --- Configuration for Club President Election ---
  const candidates = [
    { name: "Alice Wonderland", party: "Innovation & Tech Focus" },
    { name: "Bob The Builder", party: "Community & Events Focus" },
    { name: "Charlie Brown", party: "Finance & Sustainability Focus" }
  ];

  const VOTING_START_DELAY_IN_MINUTES = 15; // Voting starts 15 minutes after deployment
  const VOTING_DURATION_IN_DAYS = 3;       // Voting lasts for 3 days

  const ONE_MINUTE_IN_SECS = 60;
  const ONE_HOUR_IN_SECS = 60 * ONE_MINUTE_IN_SECS;
  const ONE_DAY_IN_SECS = 24 * ONE_HOUR_IN_SECS;
  // --- End Configuration ---

  // Get current block timestamp from Hardhat Network or the connected network
  const currentBlock = await hre.ethers.provider.getBlock("latest");
  if (!currentBlock) {
    throw new Error("Failed to get the latest block from the network. Ensure your Hardhat node or provider is running.");
  }
  const currentTime = currentBlock.timestamp;
  
  const votingStartTime = currentTime + (VOTING_START_DELAY_IN_MINUTES * ONE_MINUTE_IN_SECS); 
  const votingEndTime = votingStartTime + (VOTING_DURATION_IN_DAYS * ONE_DAY_IN_SECS); 

  console.log(`\nDeployment Time: ${new Date(currentTime * 1000).toLocaleString()}`);
  console.log(`Calculated voting start time: ${new Date(votingStartTime * 1000).toLocaleString()} (${new Date(votingStartTime * 1000).toISOString()})`);
  console.log(`Calculated voting end time: ${new Date(votingEndTime * 1000).toLocaleString()} (${new Date(votingEndTime * 1000).toISOString()})`);

  const DecentralizedVoting = await hre.ethers.getContractFactory("DecentralizedVoting");
  
  console.log("\nDeploying contract with the specified voting period...");
  const decentralizedVoting = await DecentralizedVoting.deploy(votingStartTime, votingEndTime);

  await decentralizedVoting.waitForDeployment();
  const contractAddress = await decentralizedVoting.getAddress();

  console.log("\nDecentralizedVoting contract deployed for Club President Election!");
  console.log(`Contract address: ${contractAddress}`);
  console.log(`Deployed with voting start time: ${new Date(votingStartTime * 1000).toLocaleString()}`);
  console.log(`Deployed with voting end time: ${new Date(votingEndTime * 1000).toLocaleString()}`);

  // --- Automatically update frontend contract address ---
  const appJsPath = path.join(__dirname, "..", "docs", "App.js");
  try {
    let appJsContent = fs.readFileSync(appJsPath, "utf8");
    const addressRegex = /(const\s+contractAddress\s*=\s*')([0-9a-zA-Zx]+)(';)/;
    if (addressRegex.test(appJsContent)) {
      appJsContent = appJsContent.replace(addressRegex, `$1${contractAddress}$3`);
      fs.writeFileSync(appJsPath, appJsContent, "utf8");
      console.log(`\nUpdated contract address in ${appJsPath} to: ${contractAddress}`);
    } else {
      console.warn(`\nWARNING: Could not find the contractAddress line in ${appJsPath} to update it automatically.`);
      console.warn("Please update it manually.");
    }
  } catch (error) {
    console.warn(`\nWARNING: Failed to automatically update contract address in ${appJsPath}.`);
    console.warn(error.message);
    console.warn("Please update it manually.");
  }
  // --- End frontend update ---

  console.log("\nAdding predefined candidates to the contract...");
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    console.log(`Adding candidate: ${candidate.name} (Party: ${candidate.party})`);
    const tx = await decentralizedVoting.addCandidate(candidate.name, candidate.party);
    const receipt = await tx.wait(); // Wait for the transaction to be mined
    
    // Try to find the CandidateAdded event to get the ID, or infer it.
    // Hardhat's default setup with ethers might not easily parse specific event args without more setup.
    // For simplicity, we'll assume IDs are sequential starting from 1.
    const candidateId = i + 1; 
    console.log(`Added ${candidate.name}, assumed ID: ${candidateId}. Transaction hash: ${receipt.hash}`);
  }
  console.log(`${candidates.length} candidates added.`);

  console.log("\nDeployment script finished for Club President Election.");
  console.log("You can now interact with the contract and frontend.");
}

main().catch((error) => {
  console.error("Error during deployment or setup:", error);
  process.exitCode = 1;
}); 