const mongoose = require('mongoose');

require('dotenv').config();

const db = mongoose.connect(process.env.MONGO_URI);

db.then(() => {
    console.log('Connected')
})
db.catch((err) => {
    console.error(err)
})

module.exports = db;