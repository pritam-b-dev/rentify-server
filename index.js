const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
const dotenv = require("dotenv");
dotenv.config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGODB_URI;
const PORT = 5000;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    //declareing db and collections starts.

    const db = client.db("rentify");
    const carCollection = db.collection("car");

    //declareing db and collections end.
    //-------------------------------------------------------

    // api for cars starts

    app.post("/car", async (req, res) => {
      const carData = req.body;
      const result = await carCollection.insertOne(carData);
      res.json(result);
    });

    // api for cars ends
    //------------------------------------------------------
  } catch (error) {
    console.error(error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running fine");
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
