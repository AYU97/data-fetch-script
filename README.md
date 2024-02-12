# Data Fetch and Process Script Documentation

## Overview

The Data Fetch and Process Script is designed to process NFT related details in real time. It's implemented in Node.js using TypeScript.

## Usage

### Prerequisites

1. **Node.js and npm:** Ensure that Node.js and npm are installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AYU97/data-fetch-script.git
   ```

2. Navigate to the project directory:

   ```bash
   cd data-fetch-script
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Running the Script

To start fetch:

```bash
npm run start-fetch
```

To start post processing:

```bash
npm run start-post
```

### Assumptions

- The "order.validTo" does not exist, it is "validUntil"
- Please put your Mysql database details like : host, user , password , database:(assumed to be "nft")
- create the table for your db 
 ```bash 
CREATE TABLE IF NOT EXISTS nft.activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contract_address VARCHAR(255),
        token_index VARCHAR(255),
        listing_price DECIMAL(18, 6),
        maker VARCHAR(255),
        listing_from TIMESTAMP,
        listing_to TIMESTAMP,
        event_timestamp TIMESTAMP
      )


 CREATE TABLE IF NOT EXISTS nft.tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contract_address VARCHAR(255),
        index VARCHAR(255),
        current_price DECIMAL(18, 6)
      )
```

