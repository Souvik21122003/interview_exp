const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
dotenv.config();



mongoose.connect(process.env['MONGO_URI'], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Interview schema
const interviewSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  likes: { type: Number, default: 0 },
  comments: [{ type: String }],
});

const Interview = mongoose.model('Interview', interviewSchema);

// Multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Routes
app.get('/api/interviews', async (req, res) => {
  const interviews = await Interview.find();
  res.json(interviews);
});

app.post('/api/interviews', upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  // const image = req.file.filename;

  const newInterview = new Interview({
    title,
    description,
   // image,
  });

  await newInterview.save();
  res.json({ message: 'Interview uploaded successfully' });
});

app.put('/api/interviews/:id/like', async (req, res) => {
  const id = req.params.id;
  await Interview.findByIdAndUpdate(id, { $inc: { likes: 1 } });
  res.json({ message: 'Liked successfully' });
});

app.post('/api/interviews/:id/comment', async (req, res) => {
  const id = req.params.id;
  const { comments } = req.body;

  await Interview.findByIdAndUpdate(id, {
    $push: { comments },
  });

  res.json({ message: 'Comment added successfully' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
