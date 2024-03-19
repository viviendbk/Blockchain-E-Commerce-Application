
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL NOT NULL,
    seller_id VARCHAR(255) NOT NULL,
    seller_address VARCHAR(255) NOT NULL,
    photo_url VARCHAR(255),
    bought BOOLEAN DEFAULT FALSE,
    transaction_hash VARCHAR(255),
    FOREIGN KEY (seller_id) REFERENCES users (id)
);
