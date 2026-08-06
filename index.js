require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Replace the placeholder with your Atlas connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hgpfzti.mongodb.net/?appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// ======================================
async function runStableAPIConnect() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const database = client.db("bookVerse");
    const users = database.collection("users");
    // =============================

    // CREATE USER
    // ============================
    app.post("/users", async (req, res) => {
      const user = req.body;
      if (!user.email) {
        return res.status(400).send({ message: "Error! User mail not found" });
      }
      const result = await users.insertOne(user);
      return res.send(result);
    });

    // Send a ping to confirm a successful connection
    const result = await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
    return result;
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
runStableAPIConnect().catch(console.dir);
// =======================================
// Routes
app.get("/", (req, res) => {
  res.send("Book Verse Server is running!");
});

// Start server
app.listen(port, () => {
  console.log(`Book Verse server is running on port ${port}`);
});
