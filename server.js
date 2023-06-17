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
// Set up the 'views' directory and the view engine
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('view engine', 'ejs');

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get('/', (req, res) => { 
  res.status(200)
  res.sendFile(path.join(__dirname ,"public" , '/pages/index.html'));
});

app.get('/header', (req, res) => {
  res.status(200)
  res.sendFile(path.join(__dirname, 'public', '/components/header.html'));
});

app.get('/contact', (req, res) => {
  res.status(200)
  res.sendFile(path.join(__dirname, 'public', '/pages/contact.html'));
});

app.get('/bank1', (req, res) => {
  res.status(200)
  res.sendFile(path.join(__dirname, 'public', '/images/bank.png'));
});

app.get('/bank2', (req, res) => {
  res.status(200)
  res.sendFile(path.join(__dirname, 'public', '/images/bank2.png'));
});

app.get('/user', (req, res) => {
    res.status(200)
    res.sendFile(path.join(__dirname, 'public', '/pages/user.html'));
  });

app.get('/transaction', async (req, res) => {
    try {
      const transactions = await Transaction.find();
      const populatedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          const senderAccNumber = transaction.sender;
          const sender = await User.findOne({ accNumber: senderAccNumber });
          const senderFirstName = sender ? sender.firstName : 'Unknown';
  
          const receiverAccNumber = transaction.receiver;
          const receiver = await User.findOne({ accNumber: receiverAccNumber });
          const receiverFirstName = receiver ? receiver.firstName : 'Unknown';
  
          return {
            ...transaction.toObject(),
            senderFirstName,
            receiverFirstName
          };
        })
      );
      res.render('transaction', { transactions: populatedTransactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).send('Internal Server Error');
    }
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
      res.render('transferForm', { error: 'User not found' });
      return;
    }
  
    res.render('transferForm', { user });
  });

app.get('/transferForm', async (req, res) => {
    try {
      const user = await User.find();
      res.render('transferForm', { user });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Internal Server Error');
    }
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


app.post('/amtTransfer', async (req, res) => {
  const senderId = req.body.senderId;
  const recipient = req.body.recipient;
  const amount = req.body.amount

  const transferData = {
    senderId: senderId,
    recipient: recipient,
    amount: amount
  };
  console.log(transferData)

  const sender = await User.findOne({ accNumber: senderId });
  const senderCurrentAmount = sender.amount;
  console.log(senderCurrentAmount)
  if (amount > senderCurrentAmount) {
    res.render('transferForm', { error: 'Insufficient funds' });
    return;
  }

  const updatedSenderAmount = senderCurrentAmount - amount;
  sender.amount = updatedSenderAmount;
  await sender.save();

  const recipientUser = await User.findOne({ accNumber: recipient });
  const recipientCurrentAmount = recipientUser.amount;
  const updatedRecipientAmount = recipientCurrentAmount + parseInt(amount);
  recipientUser.amount = updatedRecipientAmount;
  await recipientUser.save();

  // Create a new transaction record
  const transaction = new Transaction({
    sender: senderId,
    receiver: recipient,
    amount
  });
  await transaction.save();
  res.redirect('transaction');
});
