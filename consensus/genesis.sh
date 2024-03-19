#!/bin/bash

# Directory where  will store blockchain data
DATA_DIR="/consensus/beacondata/beaconchaindata"

# Check if the data directory exists and contains blockchain data
if [ ! -d "$DATA_DIR" ]; then
  echo "Blockchain data not found, initializing..."
  /prysmctl testnet generate-genesis --fork=capella --num-validators=64 --genesis-time-delay=15 --output-ssz=/consensus/genesis.ssz --chain-config-file=/consensus/config.yml --geth-genesis-json-in=/execution/genesis.json --geth-genesis-json-out=/execution/genesis.json
else
  echo "Blockchain data found, skipping initialization."
fi