# Blockchain E-Commerce Application

## Overview

Welcome to our Blockchain E-Commerce Application! This application allows users to register, login, buy items, and add items to the shop. It consists of two backend services: one handles the database operations, and the other manages the payment process with blockchain integration. The frontend has its own nginx server and is a simple HTML/CSS/JS application. The nginx server serves the frontend and acts as a reverse proxy to the backend services.

To facilitate easy deployment, our application is containerized using Docker. Follow the instructions below to launch the application on your local machine.

## Disclaimer

This application is a prototype and is not intended for production use. It is a simple demonstration of how blockchain technology can be integrated into an e-commerce application. The blockchain network is simulated using a testnet, and the application is not secure. It is for educational purposes only.

Also, please note that restarting the application may unsync the blockchain client, and you may need to reset the blockchain network to continue using the application with all features. To do so, run the following commands:
```
make clean
./clean
```

## Prerequisites
Before getting started, ensure you have the following dependencies installed on your system:
- Docker
- Docker Compose

## Installation and Setup
1. Clone the project repository to your local machine:
    ```
    git clone <repository_url>
    ```

2. Navigate to the project directory:
    ```
    cd <project_directory>
    ```

3. Build and start the Docker containers using Docker Compose:
    ```
    docker-compose up --build
    ```

4. Once the containers are up and running, you can access the application at:
    ```
    http://localhost:8080
    ```

## Usage
### Registration
- To register a new account, click on the "Register" button and provide the required information.

### Login
- After registration, you need to login. If you already have an account, you can log in with your credentials using the "Login" page.

### Shopping
- Once connected, you will see your blockchain address and your balance
- All available items are displayed on the home page
- Click on buy to buy an item if you have enough funds

### Adding Items to the Shop
- You can add new items by entering their name, price and image URL

### Payment Process with Blockchain
- When checking out, the payment process is seamlessly integrated with blockchain technology.
- Your transactions are secure and transparent thanks to blockchain's decentralized ledger.
