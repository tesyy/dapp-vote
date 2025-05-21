const connectWalletBtn = document.getElementById('connect-wallet-btn');
const castVoteBtn = document.getElementById('cast-vote-btn');

const connectionStatusEl = document.getElementById('connection-status');
const accountAddressEl = document.getElementById('account-address');
const networkNameEl = document.getElementById('network-name');
const candidatesListEl = document.getElementById('candidates-list');
const voteFeedbackEl = document.getElementById('vote-feedback');
const errorMessageEl = document.getElementById('error-message');
const startTimeEl = document.getElementById('start-time');
const endTimeEl = document.getElementById('end-time');
const voteStatusMessageEl = document.getElementById('vote-status-message');
const userVotedStatusEl = document.getElementById('user-voted-status');

// --- TO BE REPLACED BY USER ---
const contractAddress = '0xaAd12485cD55c8d5295e93735362e60b366a807A'; // Replace with your contract address on Sepolia (or other public net)
const contractABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_endTime",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "string",
          "name": "candidateName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "candidateParty",
          "type": "string"
        }
      ],
      "name": "addCandidate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "candidates",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "party",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "voteCount",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "candidateId",
          "type": "uint256"
        }
      ],
      "name": "castVote",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasVoted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "totalCandidates",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "votingEndTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "votingStartTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ]; // Replace with your contract's ABI array
// Example: const contractABI = [ { "inputs": [...], ... }, ... ];
// --- END OF USER REPLACEMENT SECTION ---

let provider;
let signer;
let contract;
let currentAccount = null;
let votingIsActive = false;

// Check if MetaMask is installed
if (typeof window.ethereum === 'undefined') {
    console.error('MetaMask is not installed!');
    connectionStatusEl.textContent = 'MetaMask not detected. Please install MetaMask.';
    connectWalletBtn.disabled = true;
}

async function connectWallet() {
    clearMessages();
    console.log("Attempting to connect wallet...");
    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        console.log("Provider created.");
        signer = await provider.getSigner();
        console.log("Signer obtained.");
        currentAccount = await signer.getAddress();
        console.log("Account address obtained:", currentAccount);
        const network = await provider.getNetwork();
        console.log("Network obtained:", network.name);

        connectionStatusEl.textContent = 'Connected';
        accountAddressEl.textContent = currentAccount;
        networkNameEl.textContent = network.name;
        connectWalletBtn.textContent = 'Wallet Connected';
        connectWalletBtn.disabled = true;

        console.log("Calling initializeContract()...");
        initializeContract();
        
        console.log("Calling loadVotingInfo()...");
        await loadVotingInfo();
        console.log("Returned from loadVotingInfo().");

        console.log("Calling loadCandidates()...");
        await loadCandidates();
        console.log("Returned from loadCandidates().");

        console.log("Calling checkUserVoteStatus()...");
        await checkUserVoteStatus();
        console.log("Returned from checkUserVoteStatus().");

        console.log("Wallet connection process completed.");

    } catch (error) {
        console.error('Error connecting wallet:', error);
        errorMessageEl.textContent = `Error connecting: ${error.message}`;
        connectionStatusEl.textContent = 'Connection Failed';
    }
}

function initializeContract() {
    console.log("Inside initializeContract(). Checking conditions...");
    if (provider && signer && contractAddress && contractABI.length > 0) {
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log('Contract initialized');
    } else {
        errorMessageEl.textContent = 'Contract Address or ABI not set correctly in app.js.';
        console.error('Contract Address or ABI is missing or incorrect.');
    }
}

async function loadVotingInfo() {
    console.log("Inside loadVotingInfo().");
    if (!contract) {
        console.log("loadVotingInfo: Contract not initialized, returning.");
        return;
    }
    try {
        console.log("loadVotingInfo: Calling contract.votingStartTime()...");
        const startTime = await contract.votingStartTime();
        console.log("loadVotingInfo: votingStartTime() returned:", startTime.toString());
        
        console.log("loadVotingInfo: Calling contract.votingEndTime()...");
        const endTime = await contract.votingEndTime();
        console.log("loadVotingInfo: votingEndTime() returned:", endTime.toString());
        
        const currentTime = BigInt(Math.floor(Date.now() / 1000));
        console.log("loadVotingInfo: Current time (BigInt seconds):", currentTime.toString());

        startTimeEl.textContent = new Date(Number(startTime) * 1000).toLocaleString();
        endTimeEl.textContent = new Date(Number(endTime) * 1000).toLocaleString();

        if (currentTime >= startTime && currentTime <= endTime) {
            voteStatusMessageEl.textContent = 'Voting is currently ACTIVE.';
            votingIsActive = true;
        } else if (currentTime < startTime) {
            voteStatusMessageEl.textContent = `Voting has not started yet. Starts at ${new Date(Number(startTime) * 1000).toLocaleString()}`;
            votingIsActive = false;
        } else {
            voteStatusMessageEl.textContent = `Voting has ended. Ended at ${new Date(Number(endTime) * 1000).toLocaleString()}`;
            votingIsActive = false;
        }
    } catch (error) {
        console.error("Error loading voting info:", error);
        errorMessageEl.textContent = "Could not load voting period information.";
    }
}

async function loadCandidates() {
    console.log("Inside loadCandidates().");
    if (!contract) {
        console.log("loadCandidates: Contract not initialized, returning.");
        return;
    }
    candidatesListEl.innerHTML = '<p>Loading...</p>';
    try {
        const totalCandidates = await contract.totalCandidates();
        if (totalCandidates === 0n) {
            candidatesListEl.innerHTML = '<p>No candidates added yet.</p>';
            castVoteBtn.disabled = true;
            return;
        }

        let html = '';
        for (let i = 1n; i <= totalCandidates; i++) {
            const candidate = await contract.candidates(i);
            html += `
                <div class="candidate">
                    <label>
                        <input type="radio" name="candidate" value="${candidate.id}">
                        ${candidate.name} (Party: ${candidate.party}) - Votes: ${candidate.voteCount}
                    </label>
                </div>
            `;
        }
        candidatesListEl.innerHTML = html;
        // Enable vote button only if voting is active and candidates loaded
        const userHasVoted = await contract.hasVoted(currentAccount);
        if (votingIsActive && !userHasVoted) {
            castVoteBtn.disabled = false;
        } else {
             castVoteBtn.disabled = true;
        }

    } catch (error) {
        console.error('Error loading candidates:', error);
        candidatesListEl.innerHTML = '<p>Error loading candidates.</p>';
        errorMessageEl.textContent = `Error loading candidates: ${error.message}`;
    }
}

async function checkUserVoteStatus() {
    console.log("Inside checkUserVoteStatus().");
    if (!contract || !currentAccount) {
        console.log("checkUserVoteStatus: Contract or currentAccount not available, returning.");
        return;
    }
    try {
        const hasVoted = await contract.hasVoted(currentAccount);
        if (hasVoted) {
            userVotedStatusEl.textContent = 'You have already voted.';
            castVoteBtn.disabled = true;
        } else {
            userVotedStatusEl.textContent = 'You have not voted yet.';
            if(votingIsActive) castVoteBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error checking user vote status:', error);
        errorMessageEl.textContent = 'Could not check your voting status.';
    }
}

async function castVote() {
    if (!contract) return;
    clearMessages();

    const selectedCandidateInput = document.querySelector('input[name="candidate"]:checked');
    if (!selectedCandidateInput) {
        errorMessageEl.textContent = 'Please select a candidate to vote for.';
        return;
    }
    const candidateId = selectedCandidateInput.value;

    castVoteBtn.disabled = true;
    voteFeedbackEl.textContent = 'Submitting your vote... please wait for transaction confirmation.';

    try {
        const tx = await contract.castVote(candidateId);
        await tx.wait(); // Wait for the transaction to be mined
        voteFeedbackEl.textContent = 'Vote cast successfully! Transaction confirmed.';
        await loadCandidates(); // Refresh candidate vote counts
        await checkUserVoteStatus(); // Update user voted status
    } catch (error) {
        console.error('Error casting vote:', error);
        errorMessageEl.textContent = `Error casting vote: ${error.data?.message || error.message}`;
        // Re-enable button if voting is still active and user hasn't voted
        if (votingIsActive) {
             const hasVoted = await contract.hasVoted(currentAccount);
             if (!hasVoted) castVoteBtn.disabled = false;
        }
        voteFeedbackEl.textContent = '';
    }
}

function clearMessages() {
    voteFeedbackEl.textContent = '';
    errorMessageEl.textContent = '';
}

// Event Listeners
connectWalletBtn.addEventListener('click', connectWallet);
castVoteBtn.addEventListener('click', castVote);

// Handle account and network changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
            // MetaMask is locked or the user has disconnected all accounts
            console.log("accountsChanged: No accounts found, resetting UI.");
            currentAccount = null;
            connectionStatusEl.textContent = 'Disconnected';
            accountAddressEl.textContent = 'N/A';
            networkNameEl.textContent = 'N/A';
            connectWalletBtn.textContent = 'Connect Wallet';
            connectWalletBtn.disabled = false;
            castVoteBtn.disabled = true;
            candidatesListEl.innerHTML = '<p>Connect your wallet to see candidates.</p>';
            userVotedStatusEl.textContent = '';
            // Clear voting info as well
            startTimeEl.textContent = 'Loading...';
            endTimeEl.textContent = 'Loading...';
            voteStatusMessageEl.textContent = 'Loading...';
        } else {
            // TEMPORARY DEBUG: Just log, don't automatically recall connectWallet here to simplify initial flow
            console.log("accountsChanged: Accounts found. Current account set to:", accounts[0]);
            console.log("Ensure you click 'Connect Wallet' if the DApp is not already connected.");
            // currentAccount = accounts[0]; // Optionally update currentAccount here if needed for other logic
            // provider = new ethers.BrowserProvider(window.ethereum); // Re-initialize provider if necessary
            // initializeContract(); // Re-initialize contract if provider/signer might change
            // loadVotingInfo();
            // loadCandidates();
            // checkUserVoteStatus();
            // connectWallet(); // DO NOT automatically recall connectWallet here for now
        }
    });

    window.ethereum.on('chainChanged', (chainId) => {
        console.log('Network changed to:', chainId);
        // Reload the page or re-initialize to reflect network change
        // For simplicity, we'll re-run connectWallet which handles network info
        connectWallet(); 
    });
}