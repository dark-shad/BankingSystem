const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user');
const Transaction = require('./models/transaction');
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

app.get('/userList', (req, res) => {
    User.find()
      .then(users => {
        res.json(users);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
      });
  });

app.get('/transfer/:accNumber', async (req, res) => {
    const accNumber = req.params.accNumber;
    const user = await User.findOne({ accNumber });
    if (!user) {
      // Handle the case where the user is not found
      res.render('transferForm', { error: 'User not found' });
      return;
    }
  
    res.render('transferForm', { user });
  });
  
// Set up the 'views' directory and the view engine
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('view engine', 'ejs');
// Set up a route for the transfer form
app.get('/transferForm/:accNumber', async (req, res) => {
  const users = await User.find();
  res.render('transferForm', { user });
});

app.get('/remainingUsers/:accNumber', async (req, res) => {
  try {
    const currentAccNumber = req.params.accNumber;
    const remainingUsers = await User.find({ accNumber: { $ne: currentAccNumber } }).lean();
    res.json(remainingUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch remaining users' });
  }
});



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});



