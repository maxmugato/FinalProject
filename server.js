const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = 3002;


app.use(express.static('public'));


app.use(express.json());


app.get('/index', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


app.get('/Reviews.html', (req, res) => {
  res.sendFile(__dirname + '/public/Reviews.html');
});


app.get('/page2', (req, res) => {
  res.sendFile(__dirname + '/public/page2.html');
});


app.get('/About%20Me', (req, res) => {
  res.sendFile(__dirname + '/public/about.html');
});



app.get('/Contact.html', (req, res) => {
  res.sendFile(__dirname + '/public/Contact.html');
});




app.get('/About%20Me', (req, res) => {
  res.sendFile(__dirname + '/public/LoginpageRussian.html');
});


app.get('/about_russian', (req, res) => {
  res.sendFile(__dirname + '/public/about_russian.html');
});


app.get('/Calendar.html', (req, res) => {
  res.sendFile(__dirname + '/public/Calendar.html');
});



app.get('/create-payment-intent', (req, res) => {
  res.status(405).send('GET Method Not Allowed');
});


app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Unable to create payment intent' });
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}/`);
});

