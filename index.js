const express = require("express")
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const res = require("express/lib/response");
const app = express()
const { query } = require("express");
const { json } = require("express/lib/response");
const ObjectID = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ovmo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const bikesCollection = client.db("Bike-server").collection("bikes");
        const addedCollection = client.db("Bike-server").collection("addedCollection")
        // get all data 
        app.get("/bikes", async (req, res) => {
            const query = {}
            const cursor = bikesCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        // get a single data 
        app.get('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) }
            const result = await bikesCollection.findOne(query)
            res.send(result)
        })
        // update existing data 
        app.put('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            console.log(req)
            const query = { _id: ObjectID(id) }
            const options = { upsert: true };
            const number = req.body.quantity;
            const updatedDoc = {
                $set: {
                    quantity: number,
                }
            }
            const result = await bikesCollection.updateOne(query, updatedDoc, options)
            res.send(result)
        })


        // create addeded collection 
        app.post('/bikes', async (req, res) => {
            const additem = req.body;
            const doc = {
                name: additem.name,
                email: additem.email,
                quantity: additem.quantity,
                picture: additem.photourl,
            }
            const result = await addedCollection.insertOne(doc)
            res.send(result)
        })
        // get added Collection 
        app.get('/addedCollection', async (req, res) => {
            const email = req.query.email;
            console.log(email)
            const query = { email: email }
            const cursor = addedCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        // delete item added collection 
        app.delete('/addedCollection/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) }
            const result = await addedCollection.deleteOne(query)
            res.send(result)
        })

        // delete the existing item 
        app.delete('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) }
            const result = await bikesCollection.deleteOne(query)
            res.send(result)
        })


    }
    finally { }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send("Bikes are running")
})

app.listen(port, () => {
    console.log("Bikes are listening")
})