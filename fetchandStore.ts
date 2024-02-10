// fetchAndStore.ts
import axios from "axios";
import * as mysql from "mysql2/promise";

async function fetchAndStore() {
  const apiUrl = "https://api.reservoir.tools/events/asks/v3?limit=1000";
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "db",
  });

  try {
    // Fetch events from the API
    const response = await axios.get(apiUrl);

    if (response.data && response.data.events) {
      const eventData = response.data.events;

      // Filter and store new order events
      const newOrderEvents = eventData.filter(
        (o: any) => o.event.kind === "new-order"
      );
      console.log("order events length ->", newOrderEvents.length);

      for (const orderEvent of newOrderEvents) {
        const contractAddress = orderEvent.order.contract || null;
        const tokenId = orderEvent.order.criteria?.data?.token?.tokenId || null;
        const listingPrice = orderEvent.order.price?.amount?.native || null;
        const maker = orderEvent.order.maker || null;
        const listingFrom = orderEvent.order.validFrom || null;
        const listingTo = orderEvent.order.validUntil || null;
        const eventTimestamp = orderEvent.createdAt || null;

        await connection.execute(
          `
        INSERT INTO activity
        (contract_address, token_index, listing_price, maker, listing_from, listing_to, event_timestamp)
        VALUES (?, ?, ?, ?, FROM_UNIXTIME(?), FROM_UNIXTIME(?), ?)
      `,
          [
            contractAddress,
            tokenId,
            listingPrice,
            maker,
            listingFrom,
            listingTo,
            eventTimestamp,
          ]
        );
      }
      console.log("Successfully fetched and stored events.");
    } else {
      console.error("Invalid response format from the API:", response.data);
    }
  } catch (error) {
    console.error("Error fetching and storing events:", error);
  } finally {
    await connection.end();
  }
}

// Run the function
fetchAndStore();
