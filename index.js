const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require("./models/user");
const Log = require("./models/log");
const Exercise = require("./models/exercise");

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  const newUser = await (new User({ username: req.body.username })).save();
  res.status(201).json(newUser);
});

app.get('/api/users', async(_req, res) => {
  res.status(200).json(await User.find());
});

app.post('/api/users/:_id/exercises', async(req, res) => {
  const user = await User.findById(req.params._id);
  
  const exercise = new Exercise({
    username: user.username,
    description: req.body.description,
    duration: Number(req.body.duration),
    date: !!req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
  });

  let newExercise = await exercise.save();
  let userLog = await Log.findById(user._id);

  if (!userLog) {
    userLog = new Log({
      _id: user._id,
      username: user.username,
      count: 1,
      log: [{
        description: newExercise.description,
        duration: newExercise.duration,
        date: newExercise.date
      }]
    });
  } else {
    userLog.log.push({
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date
    });
    userLog.count = userLog.log.length;
  }

  await userLog.save();
  
  newExercise._id = user._id;

  res.status(201).json(newExercise);

});

app.get('/api/users/:_id/logs', async(req, res) => {
  let log = await Log.findById(req.params._id);

  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  if(from) {
    log.log = log.log.filter(x => Date.parse(x.date) >= new Date(from));
  }

  if(to) {
    log.log = log.log.filter(x => Date.parse(x.date) <= new Date(to));
  }

  if(limit && !!Number(limit)) {
    log.log = log.log.slice(0, Number(limit)) ;
  }

  res.json(log);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
