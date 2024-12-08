const { MongoClient } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const uri = "mongodb+srv://10202008:<10202008>@flights.huvbs.mongodb.net/?retryWrites=true&w=majority&appName=Flights";

app.use(bodyParser.json());

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        await client.connect();
        const database = client.db('loginData');
        const users = database.collection('users');
        await users.insertOne({ username, password });
        res.status(200).send('Login data saved!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving login data.');
    } finally {
        await client.close();
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));