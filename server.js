import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'; 
import { Alchemy, Network } from 'alchemy-sdk';
import { isAddress } from 'ethers';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

const settings = {
  apiKey: '-ZcmixHxy9Tp1lZhD6FHU7UnLF_v9FjZ',
};

// Get the current directory using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAlchemyInstance = (network) => {
  return new Alchemy({
    ...settings,
    network: network,
  });
};

// Function to fetch tokens for a given address and network
const fetchTokens = async (address, network) => {
  if (!isAddress(address)) {
    throw new Error('Invalid Ethereum address.');
  }

  try {
    const alchemy = getAlchemyInstance(network);
    const balances = await alchemy.core.getTokenBalances(address);

    // Filter non-zero balances
    const nonZeroBalances = balances.tokenBalances.filter(
      (token) => token.tokenBalance !== '0'
    );

    return nonZeroBalances;
  } catch (error) {
    console.error('Error fetching token balances:', error.message);
    throw error;
  }
};

// Function to process and filter token balances
const processTokenBalances = async (balances, alchemy, networkName) => {
  const processedBalances = [];

  for (const token of balances) {
    try {
      const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
      const balance = token.tokenBalance / Math.pow(10, metadata.decimals);

      // Only process tokens with a balance greater than or equal to 0.1
      if (balance >= 0.1) {
        processedBalances.push({
          name: metadata.name,
          symbol: metadata.symbol,
          balance: balance.toFixed(3),
          chain: networkName, // Include chain name
        });
      }
    } catch (err) {
      console.error(`Error processing token ${token.contractAddress}: `, err);
    }
  }

  return processedBalances;
};

// Define routes

// Serve the static HTML frontend
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get portfolio data
app.get('/api/portfolio', async (req, res) => {
  const { address, networkChoice } = req.query;

  if (!address || !networkChoice) {
    return res.status(400).json({ error: 'Address and network choice are required' });
  }

  let networks = [];
  if (networkChoice === 'all') {
    // Fetch tokens from all chains
    networks = [
      { name: 'Ethereum', network: Network.ETH_MAINNET },
      { name: 'Optimism', network: Network.OPT_MAINNET },
      { name: 'Arbitrum', network: Network.ARB_MAINNET },
      { name: 'Base', network: Network.BASE_MAINNET },
    ];
  } else {
    // Fetch tokens from the selected chain
    const networkMap = {
      ethereum: { name: 'Ethereum', network: Network.ETH_MAINNET },
      base: { name: 'Base', network: Network.BASE_MAINNET },
      optimism: { name: 'Optimism', network: Network.OPT_MAINNET },
      arbitrum: { name: 'Arbitrum', network: Network.ARB_MAINNET }
    };
    
    const selectedNetwork = networkMap[networkChoice.toLowerCase()];
    
    if (!selectedNetwork) {
      return res.status(400).json({ error: 'Invalid network choice' });
    }
    
    networks = [selectedNetwork];    
  }

  try {
    const allBalances = [];

    // Iterate over the selected networks and fetch balances
    for (const net of networks) {
      if (!net || !net.name || !net.network) {
        return res.status(400).json({ error: 'Invalid network structure' });
      }

      const alchemy = getAlchemyInstance(net.network);
      const balances = await fetchTokens(address, net.network);
      const processedBalances = await processTokenBalances(balances, alchemy, net.name); // Pass the chain name
      allBalances.push(...processedBalances);
    }

    if (allBalances.length === 0) {
      return res.status(200).json({ message: 'No tokens with balance >= 0.1 found' });
    }

    res.json(allBalances);
  } catch (error) {
    console.error('Full error:', error);
    res.status(500).json({ error: 'Error fetching portfolio data' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
