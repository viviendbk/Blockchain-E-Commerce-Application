const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bodyParser = require('body-parser');
const { ethers, JsonRpcProvider, parseEther } = require('ethers');

process.on('SIGTERM', () => {
console.log('SIGTERM signal received. Closing gracefully.');
// Perform necessary cleanup
// Then exit
process.exit(0);
});

process.on('SIGINT', () => {
console.log('SIGINT signal received. Closing gracefully.');
// Perform necessary cleanup
// Then exit
process.exit(0);
});

const app = express();
const port = 3001;


const rpcServer = 'http://geth:8545';

// Middleware
app.use(bodyParser.json());

const axiosConfig = {
    headers: {
        'Content-Type': 'application/json',
    }
};

async function getUserBalance(address) {
    try {
        // Get the balance of the user from the blockchain RPC server using eth_getBalance
        const response = await axios.post(rpcServer, {
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, 'latest'],
            id: 1
        }, axiosConfig);
        const weiBalance = parseInt(response.data.result, 16);
        const etherBalance = weiBalance / 10**18;
        return etherBalance;
    } catch (error) {
        // Log details about the error
        console.error('Error getting user balance:', error);
        throw new Error('Error getting user balance', error);
    }
}

async function makeTransaction(to, privateKey, amount) {
    try {
        const provider = new JsonRpcProvider(rpcServer);
        const wallet = new ethers.Wallet(privateKey, provider);
        const transaction = await wallet.sendTransaction({
            to: to,
            value: parseEther(amount)
        });
        return transaction.hash;
    } catch (error) {
        console.error('Error making transaction:', error.message);
        throw new Error(`Error making transaction: ${error.message}`);
    }
}

// GET /api/user/balance
app.get('/api/user/:address/balance', async (req, res) => {
    const address = req.params.address;
    try {
        const balance = await getUserBalance(address);
        res.json({ balance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/transaction
app.post('/api/transaction', async (req, res) => {
    const { to, privateKey, amount } = req.body;

    try {
        const transactionHash = await makeTransaction(to, privateKey, amount);
        res.status(200).json({ success: true, transactionHash});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/check-transaction
app.post('/api/check-transaction', async (req, res) => {
    const { to, from, transaction_hash, amount } = req.body;
    try {
        const response = await axios.post(rpcServer, {
            jsonrpc: '2.0',
            method: 'eth_getTransactionByHash',
            params: [transaction_hash],
            id: 1
        }, axiosConfig);
        const transaction = response.data.result;
        if (transaction && transaction.to.toLowerCase() === to.toLowerCase() && transaction.from.toLowerCase() === from.toLowerCase() && parseInt(transaction.value, 16) >= amount * 10**18) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
