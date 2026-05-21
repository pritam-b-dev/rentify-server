const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
const dotenv = require("dotenv");
dotenv.config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);

//middleware
const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

async function run() {
  try {
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    // DB and Collections
    const db = client.db("rentify");
    const carCollection = db.collection("car");
    const bookingCollection = db.collection("bookings");

    // Create a car
    app.post("/car", verifyToken, async (req, res) => {
      const carData = req.body;
      const result = await carCollection.insertOne(carData);
      res.json(result);
    });

    //get all cars and search and filter api

    app.get("/car", async (req, res) => {
      const { search, carType } = req.query;
      const filter = {};
      if (search) {
        filter.carName = { $regex: search, $options: "i" };
      }
      if (carType) {
        filter.carType = carType;
      }
      const result = await carCollection.find(filter).toArray();
      res.json(result);
    });
    //get all cars and search and filter api ends

    app.get("/car/user/:userId", verifyToken, async (req, res) => {
      const { userId } = req.params;
      const result = await carCollection.find({ userId }).toArray();
      res.json(result);
    });

    // Get a specific car by ID
    app.get("/car/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      try {
        const result = await carCollection.findOne({
          _id: new ObjectId(id),
        });
        res.json(result);
      } catch (err) {
        res.status(400).json({ message: "Invalid ID format" });
      }
    });

    // Update car details
    app.patch("/car/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;
      try {
        const result = await carCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData },
        );
        res.json(result);
      } catch (err) {
        res.status(400).json({ message: "Invalid ID format" });
      }
    });

    // Delete a car
    app.delete("/car/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      try {
        const result = await carCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.json(result);
      } catch (err) {
        res.status(400).json({ message: "Invalid ID format" });
      }
    });

    //booking api

    app.post("/bookings", verifyToken, async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData);
      await carCollection.updateOne(
        { _id: new ObjectId(bookingData.carId) },
        { $inc: { booking_count: 1 } },
      );
      res.json(result);
    });

    app.get("/bookings/:userId", verifyToken, async (req, res) => {
      const { userId } = req.params;
      const result = await bookingCollection.find({ userId }).toArray();
      res.json(result);
    });

    //booking api ends
  } catch (error) {
    console.error(error);
  }
}

// Run the MongoDB connection function
run().catch(console.dir);

// Base Route
app.get("/", (req, res) => {
  res.send("server is running fine");
});

// Start Server
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
