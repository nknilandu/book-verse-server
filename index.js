require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();
    // =============================
    const database = client.db("bookVerse");
    const users = database.collection("users");
    const books = database.collection("books");

    // CREATE USER
    // ============================
    app.post("/users", async (req, res) => {
      const userData = req.body;
      if (!userData.email) {
        return res.status(400).send({ message: "Error! User mail not found" });
      }
      const newUser = {
        ...userData,
        balance: 500,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await users.insertOne(newUser);
      return res.send(result);
    });

    // GET USER
    // ============================
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const result = await users.findOne({ email: email });
      return res.send(result);
    });

    // UPDATE USER PROFILE
    //===========================
    app.patch("/users/:email", async (req, res) => {
      const email = req.params.email;
      const profileData = req.body;

      if (!email) {
        return res.status(400).send({ message: "Error! User mail not found" });
      }

      await users.updateOne(
        { email: email },
        {
          $set: profileData,
        },
      );
      const result = await users.findOne({ email: email });
      return res.send(result);
    });

    // UPDATE USER BALANCE
    //===========================
    app.patch("/users/:email/balance", async (req, res) => {
      const email = req.params.email;
      const amount = req.body.amount;

      if (!email || !amount) {
        return res
          .status(400)
          .send({ message: "Error! User mail or amount not found" });
      }

      await users.updateOne(
        { email: email },
        {
          $inc: { balance: amount },
        },
      );
      const result = await users.findOne({ email: email });
      return res.send(result);
    });

    // CREATE / UPLOAD BOOK
    // ============================
    app.post("/books", async (req, res) => {
      const bookData = req.body;

      if (
        !bookData.coverUrl ||
        !bookData.bookTitle ||
        !bookData.authorName ||
        !bookData.pdfUrl ||
        !bookData.uploaderEmail ||
        !bookData.rightsConfirmed
      ) {
        return res.status(400).send({
          message: "Title, PDF URL and user email are required",
        });
      }

      const newBook = {
        ...bookData,
        price: Number(bookData.price),
        rating: Number(bookData.rating),
        pages: Number(bookData.pages),
        downloads: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await books.insertOne(newBook);
      return res.send(result);
    });

    // GET ALL BOOKS
    // ============================
    app.get("/books", async (req, res) => {
      const email = req.query.email;
      const query = email ? { uploaderEmail: email } : {};

      const result = await books.find(query).toArray();
      res.send(result);
    });

    // GET SINGLE BOOK
    //=============================
    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const book = await books.findOne({ _id: new ObjectId(id) });

      if (!book) {
        return res.status(404).send({
          message: "Book not found",
        });
      }
      res.send(book);
    });

    // DELETE BOOK
    // ==========================
    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;

      if (!id) {
        return res.status(404).send({
          message: "Book not found",
        });
      }
      const result = await books.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    // ===========================================================
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
run().catch(console.dir);
// =======================================
// Routes
app.get("/", (req, res) => {
  res.send("Book Verse Server is running!");
});

// Start server
app.listen(port, () => {
  console.log(`Book Verse server is running on port ${port}`);
});
