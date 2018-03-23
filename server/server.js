'use strict'

//first we import our dependencies...
require('./config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');


const {mongoose} = require('./db/mongoose');
const {Food} = require('./models/food');

//and create our instances
const app = express();
const router = express.Router();

//set our port to either a predetermined port number if you have set it up, or 3001
const port = process.env.PORT;

//now we should configure the API to use bodyParser and look for JSON data in the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//To prevent errors from Cross Origin Resource Sharing, we will set our headers to allow CORS with middleware like so:
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');

  //and remove cacheing so we get the most recent comments
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

//now  we can set the route path & initialize the API
router.get('/', function(req, res) {
  res.json({ message: 'API Initialized!'});
});

// GET /foods
router.get('/foods', (req, res) => {
    Food.find({}).then((foods) => {
        res.send({foods});
    }, (err) => {
        res.status(400).send(err);
    })
});

// GET /foods/:id
router.get('/foods/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Food.findById(id).then((food) => {
        if (!food) {
            return res.status(404).send();
        }
        res.send({food});
    }).catch(e => res.status(400).send());
});

// POST /foods
router.post('/foods', (req, res) => {
    const food = new Food({
        name: req.body.name,
        carbs: req.body.carbs,
        prot: req.body.prot,
        fat: req.body.fat
    });

    food.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

// DELETE /foods/:id
router.delete('/foods/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Food.findByIdAndRemove(id).then((food) => {
        if (!food) {
            return res.status(404).send();
        }
        res.send({food});
    }).catch(e => res.send(400).send());
});

// PATCH /foods/:id
router.patch('/foods/:id', (req, res) => {
    const id = req.params.id;

    const body = _.pick(req.body, ['name', 'carbs', 'prot', 'fat']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Food.findByIdAndUpdate(id, {$set: body}, {new: true}).then((food) => {
        if (!food) {
            return res.status(404).send();
        }
        res.send({food});
    }).catch(e => res.status(400).send());
});



//Use our router configuration when we call /api
app.use('/api', router);

//starts the server and listens for requests
app.listen(port, function() {
  console.log(`api running on port ${port}`);
});
