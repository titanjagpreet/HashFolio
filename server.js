import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Alchemy, Network } from 'alchemy-sdk';
import { isAddress } from 'ethers';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Parse JSON bodies

const settings = {
  apiKey: process.env.ALCHEMY_API, // Replace with a valid API key
};

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAlchemyInstance = (network) => {
  return new Alchemy({
    ...settings,
    network,
  });
};

// Function to fetch tokens for a given address and network
const fetchTokens = async (address, network) => {
  if (!isAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }

  try {
    const alchemy = getAlchemyInstance(network);
    const balances = await alchemy.core.getTokenBalances(address);
    const nonZeroBalances = balances.tokenBalances.filter(
      (token) => token.tokenBalance !== '0'
    );
    return nonZeroBalances;
  } catch (error) {
    throw new Error(`Failed to fetch token balances: ${error.message}`);
  }
};

// Function to process and filter token balances
const processTokenBalances = async (balances, alchemy, networkName) => {
  const processedBalances = [];

  for (const token of balances) {
    try {
      const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
      const decimals = metadata.decimals ?? 18;
      const balance = parseInt(token.tokenBalance, 16) / Math.pow(10, decimals);

      if (balance >= 0.1) {
        processedBalances.push({
          name: metadata.name ?? 'Unknown Token',
          symbol: metadata.symbol ?? 'UNKNOWN',
          balance: balance.toFixed(3),
          chain: networkName,
        });
      }
    } catch (err) {
      console.error(`Error processing token ${token.contractAddress}:`, err.message);
      processedBalances.push({
        name: 'Unknown Token',
        symbol: 'UNKNOWN',
        balance: '0.000',
        chain: networkName,
      });
    }
  }

  return processedBalances;
};

// API endpoint to get portfolio data (defined BEFORE static middleware)
app.get('/api/portfolio', async (req, res) => {
  console.log('Received request to /api/portfolio:', req.query); // Debug log
  const { address, networkChoice } = req.query;

  if (!address || !networkChoice) {
    return res.status(400).json({ error: 'Address and network choice are required' });
  }

  if (!isAddress(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address' });
  }

  let networks = [];
  if (networkChoice.toLowerCase() === 'all') {
    networks = [
      { name: 'Ethereum', network: Network.ETH_MAINNET },
      { name: 'Optimism', network: Network.OPT_MAINNET },
      { name: 'Arbitrum', network: Network.ARB_MAINNET },
      { name: 'Base', network: Network.BASE_MAINNET },
    ];
  } else {
    const networkMap = {
      ethereum: { name: 'Ethereum', network: Network.ETH_MAINNET },
      base: { name: 'Base', network: Network.BASE_MAINNET },
      optimism: { name: 'Optimism', network: Network.OPT_MAINNET },
      arbitrum: { name: 'Arbitrum', network: Network.ARB_MAINNET },
    };

    const selectedNetwork = networkMap[networkChoice.toLowerCase()];
    if (!selectedNetwork) {
      return res.status(400).json({ error: 'Invalid network choice' });
    }
    networks = [selectedNetwork];
  }

  try {
    const allBalances = [];

    for (const net of networks) {
      if (!net || !net.name || !net.network) {
        return res.status(400).json({ error: 'Invalid network configuration' });
      }

      console.log(`Fetching tokens for ${net.name}`); // Debug log
      const alchemy = getAlchemyInstance(net.network);
      const balances = await fetchTokens(address, net.network);
      const processedBalances = await processTokenBalances(balances, alchemy, net.name);
      allBalances.push(...processedBalances);
    }

    if (allBalances.length === 0) {
      return res.status(200).json({ message: 'No tokens with balance >= 0.1 found' });
    }

    res.json(allBalances);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: error.message || 'Error fetching portfolio data' });
  }
});

// Serve static files AFTER defining API routes
app.use(express.static(path.join(__dirname, 'public')));

// Handle 404 errors (return JSON for API-like requests)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
