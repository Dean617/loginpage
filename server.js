const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const port = 3000;

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb+srv://<username>:<password>@cluster0.mongodb.net/myDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((error) => {
  console.log('Error connecting to MongoDB:', error);
});

// Session setup
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using https
}));

// Define user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username })
    .then(user => {
      if (!user) {
        return res.json({ success: false, message: 'User not found' });
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error comparing passwords' });
        }

        if (result) {
          // Store user session
          req.session.user = user;
          res.json({ success: true, message: 'Login successful' });
        } else {
          res.json({ success: false, message: 'Invalid credentials' });
        }
      });
    })
    .catch(err => {
      res.status(500).json({ success: false, message: 'Database error' });
    });
});

// Register route (for adding new users)
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error hashing password' });
    }

    // Create new user in the database
    const newUser = new User({ username, password: hashedPassword });

    newUser.save()
      .then(() => res.json({ success: true, message: 'User registered' }))
      .catch((err) => res.status(500).json({ success: false, message: 'Error saving user' }));
  });
});

// Redirect user to success page after login
app.get('/success-page', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.send('Welcome to the success page! You have logged in successfully.');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
