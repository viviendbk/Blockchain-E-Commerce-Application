#!/bin/bash

# Directory where Geth will store blockchain data
DATA_DIR="/execution/geth/chaindata"

# Check if the data directory exists and contains blockchain data
if [ ! -d "$DATA_DIR" ]; then
  echo "Blockchain data not found, initializing..."
  geth --datadir /execution init /execution/genesis.json
else
  echo "Blockchain data found, skipping initialization."
fi

# Start Geth with desired options for RPC and mining
# geth --datadir /root/.ethereum --http --http.addr "0.0.0.0" --http.port "8545" --http.vhosts "*" --http.corsdomain "*" --http.api "admin,eth,debug,miner,net,txpool,personal,web3" --networkid 424242 --maxpeers 0 --allow-insecure-unlock
