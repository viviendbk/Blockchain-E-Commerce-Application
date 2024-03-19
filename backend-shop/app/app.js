const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const axios = require('axios');

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

const jwtSecret = 'secret_key';

const app = express();
const port = 3000;

const paymentBackendAddress = 'http://frontend/payment-api';

// PostgreSQL configuration
const pool = new Pool({
  user: 'user',
  host: 'db-shop',
  database: 'database_shop',
  password: 'password',
  port: 5432,
});

// Get the private key and address of the platform account from the environment (platform_private_key and platform_address)
const platformPrivateKey = process.env.PLATFORM_PRIVATE_KEY;
const platformAddress = process.env.PLATFORM_ADDRESS;

console.log('Platform wallet address:', platformAddress);
console.log('Platform wallet private key:', platformPrivateKey.slice(0, 6) + '...'+ platformPrivateKey.slice(-4));

// Middleware
app.use(bodyParser.json());

// Routes
app.get('/api/items', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM items');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/item', async (req, res) => {
  const { name, price, photo_url, seller_address } = req.body;
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, jwtSecret);
    const { username } = decodedToken;
    const { rows } = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    const seller_id = rows[0].id;
    await pool.query('INSERT INTO items (name, price, seller_id, seller_address, photo_url) VALUES ($1, $2, $3, $4, $5)', [name, price, seller_id, seller_address, photo_url]);
    res.sendStatus(201);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password, id, address } = req.body;
  try {
    await pool.query('INSERT INTO users (username, password, id, address) VALUES ($1, $2, $3, $4)', [username, password, id, address]);
    resp = await axios.post(`${paymentBackendAddress}/transaction`, { 
      to: address,
      privateKey: platformPrivateKey, 
      amount: '1000'
     });
    res.sendStatus(201);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password ]);
      
      if (rows.length >= 1) {
        // User is authenticated
        id = rows[0].id;
        address = rows[0].address;
        const token = jwt.sign({ username, id, address }, jwtSecret, { expiresIn: '24h' });
        res.json({ token });
      } else {
        // Authentication failed
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/buy', async (req, res) => {
  // Check token
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, jwtSecret);
  const { id, username } = decodedToken;
  buyer_adress = decodedToken.address;

  const { item_id, price, seller_address, transaction_hash } = req.body;

  // Check if the transaction hash is not already in the items table
  const { rows } = await pool.query('SELECT * FROM items WHERE transaction_hash = $1', [transaction_hash]);
  if (rows.length >= 1) {
    return res.status(400).json({ error: 'Transaction hash already used' });
  }

  try {
    resp = await axios.post(`${paymentBackendAddress}/check-transaction`, { 
      to: seller_address,
      from: buyer_adress,
      transaction_hash: transaction_hash,
      amount: price
     });
    if (resp && resp.data.success) {
      // Update the items table as bought and transaction_hash to the transaction hash
      await pool.query('UPDATE items SET bought = true, transaction_hash = $1 WHERE id = $2;', [transaction_hash, item_id]);
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }
  } catch (error) {
    console.error('Error buying item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
