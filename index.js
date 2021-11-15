const express = require('express');
const {MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors =  require('cors');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

//middle ware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oqk0s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try{
        await client.connect();
        const database = client.db('motorBike');
        const serviceCollection = database.collection('services');
        const exploreCollection = database.collection('explores');
        const purchaseCollection = database.collection('purchase');
        const usersCollection =  database.collection('users')

        //get api 
        app.get('/services', async (req, res) => {
            const cursor =  serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // get api
        app.get('/explores', async (req, res) => {
            const cursor =  exploreCollection.find({});
            const explores = await cursor.toArray();
            res.send(explores);
        });

        app.get('/purchase', async (req, res) => {
            const email = req.query.userEmail;
            const query = {userEmail: email};
            console.log(query);
            const cursor = purchaseCollection.find(query);
            const purchases = await cursor.toArray();
            res.json(purchases)
        })

        // user data post api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = {email: user.email};
            const options = {upsert: true};
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        }); 

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = {email:  user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // user purchese api post
        app.post('/purchase', async (req, res) => {
            const purchase = req.body;
            const result = await purchaseCollection.insertOne(purchase)
            console.log(purchase);
            res.json(result)
        })
        
        //post api 
        app.post('/explores', async(req, res) => {
            const explores = req.body;
            const result = await exploreCollection.insertOne(explores);
            console.log(result);
            res.json(result);
        });

        //delete api
        app.delete('/explores/:id', async (req, res) => {
            const id = req.params.id;
            const query  = {_id:ObjectId(id)};
            const result = await exploreCollection.deleteOne(query);
            res.json(result);
        })
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running motor bike sales server');
});

app.listen(port, () => {
    console.log('running motor bike sales server', port);
})