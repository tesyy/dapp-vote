# COMP 4541 Individual Project: Decentralized Voting DApp

This project implements a Decentralized Voting Application (DApp) using Ethereum smart contracts and a web-based front-end. It allows users to connect their Ethereum wallets, view candidates, see voting periods, and cast votes for a "Club President Election."

**The primary instance of this DApp is live and accessible at: [https://tesyy.github.io/dapp-vote/](https://tesyy.github.io/dapp-vote/)**

## 1. Features

-   Wallet connection (MetaMask).
-   Display of voting start and end times.
-   Display of candidate list with names and parties.
-   Casting votes for a selected candidate.
-   Prevents users from voting twice.
-   Restricts voting to the defined voting period.

## 2. Interacting with the Live DApp on GitHub Pages

The live DApp at [https://tesyy.github.io/dapp-vote/](https://tesyy.github.io/dapp-vote/) is connected to a `DecentralizedVoting` smart contract that has been pre-deployed and initialized on the **Sepolia testnet**. For this live instance, the candidates were added to the Sepolia smart contract by the project developer after its deployment (e.g., using a script or Etherscan). The contract has also been verified on Sepolia Etherscan for transparency.

### How to Use the Live DApp:

1.  **Go to the DApp URL:** Navigate to [https://tesyy.github.io/dapp-vote/](https://tesyy.github.io/dapp-vote/)
2.  **Connect MetaMask to Sepolia Testnet:**
    -   Ensure you have the [MetaMask](https://metamask.io/) browser extension installed and unlocked.
    -   Crucially, connect/switch your MetaMask to the **Sepolia testnet**.
3.  **Interact with the DApp:**
    -   Click the "Connect Wallet" button on the DApp page.
    -   Once connected, the DApp will display:
        -   Your connected account address and network (should show Sepolia).
        -   The voting start and end times for the pre-configured election.
        -   The current status of the voting period.
        -   The list of predefined candidates.
    -   If the voting period is active and candidates are loaded, you can select a candidate and click "Cast Vote".
    -   Approve the transaction in MetaMask. This will require a small amount of Sepolia ETH (test currency) for gas fees.
    -   Your vote will be recorded on the Sepolia testnet for this specific DApp instance.

### Important Notes for Live DApp Users:

-   **Network:** You *must* use the Sepolia testnet in MetaMask.
-   **Gas Fees:** Voting requires Sepolia ETH for gas. You can get this from Sepolia faucets (search online for "Sepolia faucet").
-   **Pre-configured Contract:** This live version interacts with a specific, already set up contract. To experiment with your own contract, see Section 3.

## 3. Developing and Deploying Your Own Instance

If you wish to clone this project, modify it, or deploy your own instance of the smart contract and front-end, follow these instructions.

### 3.1. Prerequisites for Development

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [Git](https://git-scm.com/)
-   [MetaMask](https://metamask.io/) browser extension (for interacting with your deployments)

### 3.2. Clone the Repository

```bash
git clone https://github.com/tesyy/dapp-vote.git 
cd dapp-vote
```

### 3.3. Install Dependencies

```bash
npm install
```

### 3.4. Local Development & Testing

This allows you to run everything on your local machine using Hardhat's development network.

1.  **Start a Local Hardhat Network:**
    Open a terminal (Terminal 1) in the project root and run:
    ```bash
    npx hardhat node
    ```
    Keep this terminal running. It provides a local blockchain and test accounts.

2.  **Deploy Contract Locally & Add Candidates:**
    Open a *new* terminal (Terminal 2) in the project root. The `scripts/deploy.js` script is designed for this local setup.
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```
    This script deploys the `DecentralizedVoting` contract to your local Hardhat node, sets a voting period, and adds predefined candidates to this local instance. It also attempts to update `docs/App.js` with the local contract address.

3.  **Run the Front-End Locally:**
    Open a *third* terminal (Terminal 3). Navigate to the `docs` directory:
    ```bash
    cd docs
    python3 -m http.server 8000
    ```
    (Or use another simple HTTP server like `npx http-server -p 8000` if Python 3 is not available).

4.  **Configure MetaMask for Localhost:**
    -   Connect MetaMask to the `Localhost 8545` network (Chain ID `31337`).
    -   Import a test account from the `npx hardhat node` output using its private key.

5.  **Access Your Local DApp:** Open `http://localhost:8000` in your browser.

6.  **Run Smart Contract Tests:**
    To execute the Solidity tests located in the `test/` directory:
    ```bash
    npx hardhat test
    ```

### 3.5. Deploying Your Own Contract to a Public Network (e.g., Sepolia)

1.  **Configure Hardhat for Sepolia:**
    -   Ensure your `hardhat.config.js` has a `sepolia` network configuration:
        ```javascript
        // hardhat.config.js excerpt
        networks: {
          sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
          }
        }
        ```
    -   Create a `.env` file in the project root (and ensure it's in `.gitignore`):
        ```env
        SEPOLIA_RPC_URL="YOUR_SEPOLIA_RPC_URL_FROM_INFURA_ALCHEMY_ETC"
        PRIVATE_KEY="YOUR_PRIVATE_KEY_OF_ACCOUNT_WITH_SEPOLIA_ETH"
        ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY_FOR_VERIFICATION" # Optional but recommended
        ```
    -   Obtain `SEPOLIA_RPC_URL` from a node provider (Infura, Alchemy).
    -   Fund the account corresponding to `PRIVATE_KEY` with Sepolia ETH from a faucet.

2.  **Deploy the Contract to Sepolia:**
    -   You can adapt `scripts/deploy.js` or create a new script specifically for Sepolia deployment. Ensure it correctly sets the `_startTime` and `_endTime` constructor arguments for your desired voting period.
    -   Example command: `npx hardhat run your-sepolia-deploy-script.js --network sepolia`
    -   Note the **deployed contract address** on Sepolia.

3.  **Initialize Your Public Contract (Add Candidates):**
    -   A newly deployed public contract is empty. Add candidates using one of these methods:
        -   **Modify and run `scripts/addCandidatesSepolia.js`:** Update the placeholder address in this script with your new Sepolia contract address. Then run: `npx hardhat run scripts/addCandidatesSepolia.js --network sepolia`
        -   **Use Etherscan:** If you verify your contract (see next step), use the "Write Contract" tab on Sepolia Etherscan.

4.  **Verify Your Contract on Sepolia Etherscan (Recommended):**
    -   This makes your source code public and allows interaction via Etherscan.
    -   You can verify manually on the Sepolia Etherscan website or use Hardhat's verification plugin (`@nomicfoundation/hardhat-verify`).
    -   For plugin use, ensure `etherscan.apiKey` is set in `hardhat.config.js` (using `ETHERSCAN_API_KEY` from `.env`).
    -   Command: `npx hardhat verify --network sepolia YOUR_SEPOLIA_CONTRACT_ADDRESS "constructorArg1" "constructorArg2"` (Provide actual constructor arguments if any, like start and end times).

### 3.6. Hosting Your Own Front-End (e.g., on GitHub Pages)

If you want to host your own version of the front-end connected to *your* publicly deployed contract:

1.  **Update `docs/App.js`:** Change `const contractAddress = '...';` to *your* new public contract address (e.g., your Sepolia address).
2.  **Commit and Push:** Save `docs/App.js`, commit, and push to your GitHub repository.
3.  **Configure GitHub Pages:**
    -   In your GitHub repository settings, go to "Pages".
    -   Set the source to deploy from your main branch and the `/docs` folder.
    -   Your site will be available at `https://<your-username>.github.io/<your-repository-name>/`.

## Project Structure Overview

-   `contracts/DecentralizedVoting.sol`: The Solidity smart contract.
-   `scripts/`: Deployment and utility scripts.
-   `test/`: Smart contract tests.
-   `docs/`: Static front-end files.
-   `hardhat.config.js`: Hardhat configuration.
-   `package.json`: Project dependencies.
-   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
-   `README.md`: This file.

---
This README provides guidance for interacting with the live DApp and for developing your own instance. Feel free to expand it.

