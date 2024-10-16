const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/contactForm', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Create a Mongoose schema
const contactFormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  date: { type: String, required: true },
  dayTime: { type: String, required: true },
  service: { type: String, required: true },
  message: { type: String }
});

const ContactForm = mongoose.model('ContactForm', contactFormSchema);
// get 
app.get('/api/contact', async (req, res) => {
  try {
    const contacts = await ContactForm.find(); // Fetch all entries
    res.status(200).json(contacts); // Send them as a JSON response
  } catch (error) {
    console.error('Error fetching contact forms:', error);
    res.status(500).json({ msg: 'Error fetching contact forms', error });
  }
});
// Routes
app.post('/api/contact', async (req, res) => {
  const { name, mobile, date, dayTime, service, message } = req.body;

  try {
    // Log the incoming date and time to verify
    console.log('Incoming Request:', { date, dayTime });

    // Check if the date and dayTime slot is already booked by any user
    const existingAppointment = await ContactForm.findOne({ date, dayTime });

    // Log the result of the database query to verify if it finds an existing appointment and if it finds
    console.log('Existing Appointment:', existingAppointment);

    if (existingAppointment) {
      // If the time slot is already booked, return an error
      return res.status(400).json({ msg: 'This time slot is already booked. Please select a different time.' });
    }

    // If no existing appointment, create a new one
    const newContact = new ContactForm({
      name,
      mobile,
      date,
      dayTime,
      service,
      message
    });

    await newContact.save();
    res.status(201).json({ msg: 'Appointment booked successfully' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ msg: 'Error submitting form', error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
