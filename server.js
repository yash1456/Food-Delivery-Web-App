require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const url = 'mongodb+srv://admin:admin@cluster0.gazcn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
var bodyParser = require('body-parser')
var cors = require('cors')
const app = express()
var appRoutes = require("./routes/appRoutes")
var adminRoutes = require('./routes/adminRoute')
const morgan = require('morgan')

// process.env.PORT hoy to e else 3000
const PORT = process.env.PORT || 3000

// some useful library
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

 
// data base connection
mongoose.Promise=global.Promise
mongoose.connect(url, { useNewUrlParser: true ,useUnifiedTopology: true})
const con = mongoose.connection
con.on('open', () => {
    console.log("database connected");
})



// for testing purposr
app.get('/', (req, res) => {
    res.send("Hello from Serverrrrrrrr")
})



// route configure
app.use('/', appRoutes)
app.use('/admin', adminRoutes)
app.use(morgan('tiny'));



// print console message
app.listen(PORT, () => {
    console.log(`Listing onnn port ${PORT}`);
})

