const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecentralizedVoting", function () {
    let DecentralizedVoting;
    let voting;
    let owner;
    let addr1;
    let addr2;
    let addrs;
    let startTime, endTime;

    beforeEach(async function () {
        DecentralizedVoting = await ethers.getContractFactory("DecentralizedVoting");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Define start and end times for the voting period
        const currentBlock = await ethers.provider.getBlock('latest');
        const now = currentBlock.timestamp;
        startTime = BigInt(now + 60); // Voting starts in 60 seconds from now
        endTime = BigInt(now + 3600); // Voting ends 1 hour after start

        voting = await DecentralizedVoting.deploy(startTime, endTime);
        await voting.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct voting start and end times", async function () {
            expect(await voting.votingStartTime()).to.equal(startTime);
            expect(await voting.votingEndTime()).to.equal(endTime);
        });

        // This test assumes your contract has an owner() function,
        // for example, if it inherits from OpenZeppelin's Ownable.
        // If not, you should remove or modify this test.
        it("Should set the deployer as the owner (if contract has an owner)", async function () {
            // First, check if an owner function exists to avoid errors if it doesn't
            if (typeof voting.owner === "function") {
                expect(await voting.owner()).to.equal(owner.address);
            } else {
                this.skip(); // Skip test if owner function doesn't exist
            }
        });
    });

    describe("Candidate Management", function () {
        // This test assumes your addCandidate function might be restricted (e.g., onlyOwner).
        // If it's public, this test needs adjustment or removal.
        it("Should allow owner to add a candidate", async function () {
            if (typeof voting.owner !== "function") { // If no owner, assume addCandidate is public
                 await expect(voting.connect(owner).addCandidate("Candidate A", "Party X"))
                    .to.emit(voting, "CandidateAdded") // Assuming an event "CandidateAdded(uint id, string name, string party)"
                    .withArgs(1, "Candidate A", "Party X"); // Args might vary based on your event
                const candidate = await voting.candidates(1);
                expect(candidate.name).to.equal("Candidate A");
                expect(await voting.totalCandidates()).to.equal(1);
            } else { // If there IS an owner function, test owner restriction
                await expect(voting.connect(owner).addCandidate("Candidate A", "Party X"))
                    .to.emit(voting, "CandidateAdded") 
                    .withArgs(1, "Candidate A", "Party X");
                const candidate = await voting.candidates(1);
                expect(candidate.name).to.equal("Candidate A");
                expect(await voting.totalCandidates()).to.equal(1);

                // Test non-owner restriction
                await expect(
                    voting.connect(addr1).addCandidate("Candidate B", "Party Y")
                ).to.be.revertedWith("Ownable: caller is not the owner"); // Or your specific revert message
            }
        });
        
        it("Should increment candidate ID correctly", async function () {
            await voting.connect(owner).addCandidate("Candidate 1", "Party A");
            const candidate1 = await voting.candidates(1);
            expect(candidate1.id).to.equal(1);

            await voting.connect(owner).addCandidate("Candidate 2", "Party B");
            const candidate2 = await voting.candidates(2);
            expect(candidate2.id).to.equal(2);
            expect(await voting.totalCandidates()).to.equal(2);
        });
    });

    describe("Voting", function () {
        beforeEach(async function () {
            await voting.connect(owner).addCandidate("Candidate 1", "Independent");
            // Fast forward time to be within the voting period
            await ethers.provider.send("evm_setNextBlockTimestamp", [Number(startTime) + 1]); // 1 sec into voting period
            await ethers.provider.send("evm_mine");
        });

        it("Should allow a user to cast a vote when voting is active", async function () {
            await expect(voting.connect(addr1).castVote(1))
                .to.emit(voting, "VoteCast") // Assuming an event "VoteCast(address voter, uint candidateId)"
                .withArgs(addr1.address, 1); 

            const candidate = await voting.candidates(1);
            expect(candidate.voteCount).to.equal(1);
            expect(await voting.hasVoted(addr1.address)).to.be.true;
        });

        it("Should not allow a user to vote twice", async function () {
            await voting.connect(addr1).castVote(1);
            await expect(
                voting.connect(addr1).castVote(1)
            ).to.be.revertedWith("You have already voted.");
        });

        it("Should not allow voting for a non-existent candidate", async function () {
            await expect(
                voting.connect(addr1).castVote(99) // Assuming candidate ID 99 doesn't exist
            ).to.be.revertedWith("Invalid candidate ID.");
        });

        it("Should not allow voting if voting period is not active (before start)", async function () {
            const currentBlock = await ethers.provider.getBlock('latest');
            const now = currentBlock.timestamp;
            const futureStartTime = BigInt(now + 7200); // 2 hours
            const futureEndTime = BigInt(futureStartTime + 3600); // 1 hour duration
            
            const newVoting = await DecentralizedVoting.deploy(futureStartTime, futureEndTime);
            await newVoting.waitForDeployment();
            await newVoting.connect(owner).addCandidate("Future Candidate", "Party Future");

            await expect(
                newVoting.connect(addr1).castVote(1)
            ).to.be.revertedWith("Voting period is not active.");
        });

        it("Should not allow voting if voting period is not active (after end)", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [Number(endTime) + 1]); // 1 sec after voting period
            await ethers.provider.send("evm_mine");
            await expect(
                voting.connect(addr1).castVote(1)
            ).to.be.revertedWith("Voting period is not active.");
        });
    });
}); 