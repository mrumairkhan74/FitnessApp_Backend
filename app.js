const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors')
// all routes
const apiRoutes = require('./routes/AllRoutes')



// error handler
const errorHandler = require('./middleware/error/ErrorHandler');




const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL,  // your frontend (html file served from Live Server / VSCode)
    methods: ["GET", "POST"],
    credentials: true
}))
// for json style save data
app.use(express.json());

// form use in postman and send data from form to database
app.use(express.urlencoded({ extended: true }))

// for cookies
app.use(cookieParser())

// error handler

// for checking server is running and api call is working or not
app.get('/api', (req, res) => {
    return res.status(200).json('Server running')
});





// adminRoutes
app.use('/api', apiRoutes)
app.use(errorHandler)


// export module
module.exports = app 