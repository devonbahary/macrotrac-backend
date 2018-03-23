const mongoose = require('mongoose');

mongoose.Promise = global.Promise; // use regular Promise
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};
