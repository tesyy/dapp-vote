# Decentralized Voting DApp

This project implements a Decentralized Voting Application (DApp) using Ethereum smart contracts and a web-based front-end. It allows users to connect their Ethereum wallets, view candidates, see voting periods, and cast votes for a "Club President Election."

The DApp is live and accessible at: [https://tesyy.github.io/dapp-vote/](https://tesyy.github.io/dapp-vote/)

## Project Structure

-   `contracts/DecentralizedVoting.sol`: The Solidity smart contract for the voting logic.
-   `scripts/deploy.js`: Hardhat script to deploy the smart contract and initialize it with candidates and voting times. It also attempts to update the contract address in the front-end for local development.
-   `hardhat.config.js`: Hardhat configuration file.
-   `docs/`: Contains the static front-end files (`index.html`, `App.js`, and any CSS) served by GitHub Pages.
-   `test/`: Contains Hardhat tests for the smart contract.
-   `package.json`: Defines project dependencies and scripts.

## Features

-   Wallet connection (MetaMask).
-   Display of voting start and end times.
-   Display of candidate list with names and parties.
-   Casting votes for a selected candidate.
-   Prevents users from voting twice.
-   Restricts voting to the defined voting period.


## Accessing the Live DApp on GitHub Pages

The DApp is hosted on GitHub Pages at: [https://tesyy.github.io/dapp-vote/](https://tesyy.github.io/dapp-vote/)

For the live DApp to function correctly, it needs to connect to a `DecentralizedVoting` smart contract deployed on the **Sepolia testnet**.

### Ensuring the Live DApp Works:

1.  **Deploy Your Smart Contract to Sepolia Testnet:**
    -   Using Hardhat or another deployment tool, deploy your `contracts/DecentralizedVoting.sol` smart contract specifically to the **Sepolia testnet**.
    -   Carefully note the **deployed contract address** on the Sepolia testnet.

2.  **Update Front-End Configuration (`docs/App.js`):
    -   Open the `docs/App.js` file in your local repository.
    -   Find the line: `const contractAddress = '...';`
    -   Replace the existing address with **your new Sepolia contract address** obtained from the previous step.
    -   The `contractABI` variable in `docs/App.js` should generally remain unchanged as it's determined by the contract structure, not its deployment location.

3.  **Commit and Push Changes to GitHub:**
    -   Save the modified `docs/App.js` file.
    -   Commit this change to your Git repository:
        ```bash
        git add docs/App.js
        git commit -m "Update contract address to Sepolia deployment for live DApp"
        git push
        ```
    -   GitHub Pages will automatically rebuild your site from the `docs/` folder in your specified branch (usually `main` or `master`). This might take a few minutes.

### Interacting with the Live DApp:

Once the above steps are completed and `docs/App.js` points to a valid contract on the Sepolia testnet:

1.  **Go to the DApp URL:** [https://tesyy.github.io/dapp-vote/](https://tesyy.github.io/dapp-vote/)
2.  **Connect MetaMask to Sepolia Testnet:**
    -   Ensure your MetaMask wallet is installed and unlocked.
    -   Crucially, connect MetaMask to the **Sepolia testnet**.
3.  **Interact:**
    -   Click the "Connect Wallet" button on the DApp.
    -   If the DApp successfully connects to your contract on Sepolia, it will display voting information, candidates, and allow you to vote.

### GitHub Pages Configuration Notes:

-   This project is configured to serve the GitHub Pages site from the `/docs` folder of the `main` (or `master`) branch. You can verify this in your GitHub repository settings under "Settings" > "Pages".

### Important Considerations for the Live DApp:

-   **Network Consistency:** Users *must* have their MetaMask connected to the **Sepolia testnet** for the DApp to function correctly with the intended public contract.
-   **Gas Fees:** All transactions on the Sepolia testnet (like casting a vote) will require users to pay gas fees in Sepolia ETH (which is test currency, not real ETH).
-   **Contract Initialization:** Ensure your smart contract deployed on Sepolia has candidates added and the voting period is correctly set up according to your needs.
-   **Security:** While Sepolia is a testnet, always practice good security habits. If you were to deploy to a mainnet with real value, ensure your smart contract code is thoroughly audited.

---

This README provides guidance for interacting with the live DApp. Feel free to expand it with more details about your project.

