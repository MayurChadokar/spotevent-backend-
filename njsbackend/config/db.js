const { Sequelize } = require("sequelize");

// Direct credentials (as provided)
// const DB_HOST = "193.203.184.74";
// const DB_USER = "u818631783_db";
// const DB_PASSWORD = "ch22UXqLsdyPwe198";
// const DB_DATABASE = "u818631783_db";
const DB_TIMEZONE = "Asia/Kolkata";
const DB_CONNECTION_LIMIT = 10;

const DB_HOST = "119.18.49.9";
const DB_USER = "mezfjqmy_sopaevuser";
const DB_PASSWORD = "6im@@LHp^!8n";
const DB_DATABASE = "mezfjqmy_sopa_events_2025";

// const DB_USER = "u818631783_TestUser";
// const DB_PASSWORD = "Test@123#$rthff";
// const DB_DATABASE = "u818631783_test";
// Initialize Sequelize
const sequelize = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
  pool: {
    max: DB_CONNECTION_LIMIT,
    min: 0,
    idle: 10000,
  },
  timezone: DB_TIMEZONE || "+00:00", // Optional
});

// Test connection
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((err) =>
    console.error("❌ Unable to connect to the database:", err)
  );

module.exports = sequelize;
