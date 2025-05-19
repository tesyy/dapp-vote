const hre = require("hardhat");

async function main() {
  console.log("Deploying DecentralizedVoting contract...");

  // Calculate voting times (e.g., starts in 1 hour, ends 24 hours after start)
  const ONE_HOUR_IN_SECS = 60 * 60;
  const ONE_DAY_IN_SECS = 24 * ONE_HOUR_IN_SECS;

  // Get current block timestamp from Hardhat Network or the connected network
  const currentBlock = await hre.ethers.provider.getBlock("latest");
  const currentTime = currentBlock.timestamp;
  
  const votingStartTime = currentTime + ONE_HOUR_IN_SECS; 
  const votingEndTime = votingStartTime + ONE_DAY_IN_SECS; 

  console.log(`Calculated voting start time: ${new Date(votingStartTime * 1000).toISOString()}`);
  console.log(`Calculated voting end time: ${new Date(votingEndTime * 1000).toISOString()}`);

  const DecentralizedVoting = await hre.ethers.getContractFactory("DecentralizedVoting");
  
  // Pass constructor arguments for startTime and endTime
  const decentralizedVoting = await DecentralizedVoting.deploy(votingStartTime, votingEndTime);

  await decentralizedVoting.waitForDeployment();
  const contractAddress = await decentralizedVoting.getAddress();

  console.log("DecentralizedVoting contract deployed!");
  console.log(`Contract address: ${contractAddress}`);
  console.log(`Deployed with voting start time: ${new Date(votingStartTime * 1000).toLocaleString()}`);
  console.log(`Deployed with voting end time: ${new Date(votingEndTime * 1000).toLocaleString()}`);

  // You can add further setup here, like adding initial candidates
  // Example:
  // console.log("\nAdding initial candidates...");
  // const tx1 = await decentralizedVoting.addCandidate("Candidate Alice", "Party A");
  // await tx1.wait();
  // console.log("Added Candidate Alice, ID: 1");
  // const tx2 = await decentralizedVoting.addCandidate("Candidate Bob", "Party B");
  // await tx2.wait();
  // console.log("Added Candidate Bob, ID: 2");

  console.log("\nDeployment script finished.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 