const hre = require("hardhat");

async function main() {
  const sepoliaContractAddress = "0xaAd12485cD55c8d5295e93735362e60b366a807A"; // Replace
  const candidatesToAdd = [
    { name: "Bob The Builder", party: "Community & Events Focus" },
    { name: "Charlie Brown", party: "Finance & Sustainability Focus" }
  ];

  const DecentralizedVoting = await hre.ethers.getContractFactory("DecentralizedVoting");
  // Attach to the existing contract on Sepolia
  const votingContract = DecentralizedVoting.attach(sepoliaContractAddress);
  console.log(`Attached to contract at ${sepoliaContractAddress} on Sepolia`);

  for (const cand of candidatesToAdd) {
    console.log(`Adding candidate: ${cand.name} (Party: ${cand.party})`);
    const tx = await votingContract.addCandidate(cand.name, cand.party);
    await tx.wait();
    console.log(`Added ${cand.name}. Transaction hash: ${tx.hash}`);
  }
  console.log("All candidates added to Sepolia contract.");
}

main().catch(console.error);
