const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user');
var path = require("path");
const connectDB = require("./DB/connection");
const app = express();
const port = 3000;

connectDB();

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to serve index.html
app.get('/', (req, res) => { 
  res.status(200)
  res.sendFile(path.join(__dirname ,"public" , '/pages/index.html'));
});

// Route to serve user.html
app.get('/user', (req, res) => {
    res.status(200)
    res.sendFile(path.join(__dirname, 'public', '/pages/user.html'));
  });

app.get('/transaction', (req, res) => {
    res.status(200)
    res.sendFile(path.join(__dirname, 'public', '/pages/transaction.html'));
  });

app.get('/users', (req, res) => {
    User.find()
      .then(users => {
        res.json(users);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
      });
  });

// Route to handle user creation
app.post('/users', (req, res) => {
  const { firstName, lastName, email, amount } = req.body;

  // Create a new user object
  const newUser = new User({
    firstName,
    lastName,
    email,
    amount
  });

  // Save the user to the database
  newUser.save()
    .then(() => {
      res.status(201).send('User created successfully');
    })
    .catch((err) => {
      console.error('Error creating user:', err);
      res.status(500).send('Error creating user');
    });
});



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
