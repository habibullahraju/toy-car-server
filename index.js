const express = require("express");
const cors = require("cors");
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("GlazeCar server is running!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3f1y3cg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const carCollection = client.db("glazeCar").collection("cars");

    app.get("/all-cars/", async (req, res) => {
      const result = await carCollection.find().limit(20).toArray();
      res.send(result);
    });
    app.get("/search/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await carCollection
        .find({name: {$regex: searchText, $options: "i"}})
        .toArray();
      res.send(result);
    });
    app.get("/tractor-car/:text", async (req, res) => {
      const id = req.params.text;
      const cursor = carCollection.find({subCategory: id}).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/car-details/:id", async (req, res) => {
      const id = req.params.id;
      const result = await carCollection.findOne({_id: new ObjectId(id)});
      res.send(result);
    });
    app.get("/my-all-toys/:email", async (req, res) => {
      const email = req.params.email;

      const result = await carCollection.find({sellerEmail: email}).toArray();
      res.send(result);
    });
    app.post("/add-toy", async (req, res) => {
      const newToy = req.body;
      const result = await carCollection.insertOne(newToy);
      res.send(result);
    });
    app.get("/ascending/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = carCollection
        .find({sellerEmail: email})
        .sort({price:1})
        const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/descending/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = carCollection
        .find({sellerEmail: email})
        .sort({price:-1})
        const result = await cursor.toArray();
      res.send(result);
    });
    app.put("/update-toy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updateToy = req.body;

      const updatedToy = {
        $set: {
          pictureUrl: updateToy.pictureUrl,
          name: updateToy.name,
          sellerName: updateToy.sellerName,
          sellerEmail: updateToy.sellerEmail,
          subCategory: updateToy.subCategory,
          price: updateToy.price,
          rating: updateToy.rating,
          availableQuantity: updateToy.availableQuantity,
          description: updateToy.description,
        },
      };

      const result = await carCollection.updateOne(filter, updatedToy, options);
      res.send(result);
    });

    app.delete("/delete-toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await carCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`GlazeCar server is running on port: ${port}`);
});
