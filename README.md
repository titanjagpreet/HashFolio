# HashFolio - Crypto Portfolio Tracker

HashFolio is a web application that allows users to track their crypto portfolio across multiple chains, including Ethereum, Optimism, Arbitrum, and Base. It fetches token balances from various blockchains using the Alchemy SDK and displays them in a user-friendly interface with a detailed chart for token allocation.

## Features

- **Multi-chain Support:** Track tokens on Ethereum, Optimism, Arbitrum, and Base.
- **Token Balances:** Fetch and display the balance of tokens with a minimum value of 0.1.
- **Chart Visualization:** A doughnut chart displays the distribution of tokens in the portfolio.
- **Responsive UI:** Mobile-friendly with a clean and modern design built with Tailwind CSS.
- **Backend with Alchemy SDK:** Server-side fetching of token balances using the Alchemy SDK and Ethers.js for Ethereum address validation.

## Installation

### Prerequisites

Before running the application, ensure that you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or above)
- [npm](https://www.npmjs.com/) (or [yarn](https://yarnpkg.com/))

### Setup

1. **Clone the repository**
    
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```
    
2. **Install dependencies**
    
    Install both frontend and backend dependencies:
    
    ```bash
    npm install
    ```
    
3. **Backend Configuration**
    
    The backend is set up with the Alchemy API to fetch token balances from multiple networks. Ensure that you have an Alchemy API key and add it to the backend:
    
    - Update the `server.js` file in the `settings` object with your Alchemy API key.
    
    ```
    const settings = {
      apiKey: '<your-alchemy-api-key>',
    };
    ```
    
4. **Start the development server**
    
    Run the following command to start both the frontend and backend server:
    
    ```bash
    npm start
    ```
    
    The server will run on `http://localhost:3000`.
    
5. **Open the application**
    
    Open your browser and go to `http://localhost:3000` to access the HashFolio app.
    

## Usage

1. **Enter a wallet address**: Type in your Ethereum address (or any supported chain) in the input field.
2. **Select a chain**: Choose the blockchain network you want to query (Ethereum, Optimism, Arbitrum, or Base). To fetch tokens from all chains, select "All Chains."
3. **Fetch Portfolio**: Click the "Fetch Portfolio" button to fetch your token balances and display them in a table and a chart.

## Folder Structure

- `public/`: Contains the frontend files.
    - `index.html`: Home page of the application.
    - `portfolio.html`: Portfolio page displaying token balances.
- `server.js`: Express server that connects to Alchemy, fetches token balances, and serves the frontend.
- `package.json`: Contains the project dependencies and scripts.
- `package-lock.json`: Automatically generated file containing the exact versions of installed dependencies.

## Technologies Used

- **Backend**: Node.js, Express.js, Alchemy SDK, Ethers.js
- **Frontend**: HTML, CSS (Tailwind), JavaScript (Chart.js for data visualization)
- **Other Libraries**: CORS for cross-origin resource sharing, Path for handling file paths, Ethers.js for Ethereum address validation.

## License

This project is licensed under the MIT License - see the [LICENSE](https://chatgpt.com/c/LICENSE) file for details.

### Steps to Customize:

1. **Replace `<repository-url>`** with your actual Git repository URL.
2. **Replace `<your-alchemy-api-key>`** in `server.js` with your Alchemy API key.

This `README.md` will guide users through setting up the project and understanding its purpose and structure. Let me know if you need any changes!