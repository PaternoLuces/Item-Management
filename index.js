require('dotenv').config();
const express = require("express");
const { MongoClient,ObjectId  } = require("mongodb");
const app = express();
const port = 5000;
const cors = require("cors");

app.use(express.json());

app.use(cors());
app.use(express.static('public'));


const url = process.env.MONGODB; 
const dbName = "luces";
const client = new MongoClient(url);

async function main() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    const collection = db.collection("items");
    const userCollection = db.collection("user");

    
    app.post("/items", async (req, res) => {
      const item = req.body;
      const result = await collection.insertOne(item);
      res.status(201).send(result);
    });

    
    app.get("/items", async (req, res) => {
      const items = await collection.find({}).toArray();
      res.status(200).send(items);
    });

    
    app.put("/items/:id", async (req, res) => {
      const id = req.params.id;
      const newData = req.body;
      const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: newData });
      res.status(200).send(result);
    });

    
    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;

      console.log('Trigger delete, id is: ', id)

      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      console.log('Result is: ', result)

      res.status(200).send(result);
    });

    app.post("/login", async (req, res) => {
      const { username, password } = req.body;

      console.log("Account is: ", req.body);

      const data = await userCollection.findOne({
        
        username: username,
      });

      console.log("Data is: ", data);

      if (data.password === password) {
        
        res.status(200).send(data);
      } else {
        res.status(401).send("Login failed: Incorrect password");
      }
    });

    console.log("Starting server...");



    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("An error occurred", err);
  }
}

main().catch(console.error);
