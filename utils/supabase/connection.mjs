import pkg from "pg";
const { Client } = pkg;

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Supabase SSL
    },
  });

  try {
    await client.connect();
    console.log("Connected to the database successfully!");
  } catch (err) {
    console.error("Database connection error:", err.message);
  } finally {
    await client.end();
  }
})();
