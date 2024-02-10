// postProcessing.ts
import * as mysql from "mysql2/promise";

async function postProcess() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "db",
  });

  try {
    // Rule a: Add or update entries in the "tokens" table
    const [activityResults] = await connection.execute(
      "SELECT * FROM activity"
    );
    const activities = activityResults as any[];

    for (const activity of activities) {
      const [tokenExists] = await connection.execute(
        `
        SELECT id FROM tokens WHERE contract_address = ? AND \`index\` = ?
      `,
        [activity.contract_address, activity.token_index]
      );

      if (
        tokenExists &&
        Array.isArray(tokenExists) &&
        tokenExists.length === 0
      ) {
        // NFT doesn't exist in the tokens table, add it
        await connection.execute(
          `
          INSERT INTO tokens (contract_address, \`index\`, current_price)
          VALUES (?, ?, ?)
        `,
          [activity.contract_address, activity.token_index, null]
        );
      }
      // else NFT already exists, no need to add
    }

    // Rule b: Set current_price to null for expired listings with no other active listings
    const [expiredListings] = await connection.execute(`
      SELECT contract_address, token_index
      FROM activity
      WHERE listing_to < NOW() AND NOT EXISTS (
        SELECT 1
        FROM activity AS a2
        WHERE a2.contract_address = activity.contract_address
          AND a2.token_index = activity.token_index
          AND a2.listing_to > NOW()
      )
    `);

    for (const listing of expiredListings as any[]) {
      await connection.execute(
        `
        UPDATE tokens
        SET current_price = NULL
        WHERE contract_address = ? AND \`index\` = ?
      `,
        [listing.contract_address, listing.token_index]
      );
    }

    // Rule c: Set the lowest valid listing as the current price for each NFT
    const [lowestListings] = await connection.execute(`
      SELECT contract_address, token_index, MIN(listing_price) AS min_price
      FROM activity
      WHERE listing_to > NOW()
      GROUP BY contract_address, token_index
    `);

    for (const lowestListing of lowestListings as any[]) {
      await connection.execute(
        `
        UPDATE tokens
        SET current_price = ?
        WHERE contract_address = ? AND \`index\` = ?
      `,
        [
          lowestListing.min_price,
          lowestListing.contract_address,
          lowestListing.token_index,
        ]
      );
    }
  } catch (error) {
    console.error("Error in post-processing:", error);
  } finally {
    await connection.end();
  }
}

// Run the function
postProcess();
