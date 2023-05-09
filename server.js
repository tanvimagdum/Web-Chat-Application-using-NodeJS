var express = require("express")
var bodyParser = require("body-parser")
var app = express()
var http = require("http").Server(app)
var io = require("socket.io")(http)
var mongoose = require("mongoose")

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

var dbUrl = "mongodb+srv://user:user@cluster0.qf9dktv.mongodb.net/?retryWrites=true&w=majority"

var Message = mongoose.model("Message", {
    name: String,
    message: String
})


app.get("/messages", (req, res) => {
    Message.find({})
        .then((messages) => {
            res.send(messages)
        })
        .catch((err) => {
            console.log(err)
            res.sendStatus(500)
        })
})

app.post("/messages", (req, res) => {
    var message = new Message(req.body)

    message.save()
    .then(() => {
        console.log("Saved")
        return Message.findOne({message: "badword"})
    })
    .then(censored => {
        if(censored) {
            console.log("Censored words found", censored)
            return Message.deleteOne({_id: censored.id})
        }
        io.emit("message", req.body)
        res.sendStatus(200)
    })
    .catch((err) => {
      res.sendStatus(500)
      return console.error(err)
    })
    
})

io.on("connection", (socket) => {
    console.log("user connected")
})

mongoose.connect(dbUrl)

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to database');
})

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from database');
})

var server = http.listen(3000, () => {
    console.log("Server listening on port ", server.address().port)
  })