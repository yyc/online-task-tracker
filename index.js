//Some live feedback to tell you that the app is running
console.log("App started!");

//load the libraries we need at the start
var express = require("express");
var jade  = require("jade");
var Sequelize = require("sequelize");
var bodyParser = require("body-parser");

var sequelize = new Sequelize("sqlite://"+__dirname+"/db/database.sqlite");

var Task = sequelize.define("tasks",{
  id: {
    type: Sequelize.INTEGER
    , primaryKey: true
    , autoIncrement: true
  }
  , creator: {
    type: Sequelize.STRING
    , field: "first_name"
  }
  , title: {
    type: Sequelize.STRING
    , field: "title"
  }
  , complete: {
    type: Sequelize.BOOLEAN
    , field: "complete"
  }
});

Task.sync({force:true}).then(function(){
  return Task.create({
    creator: "Admin"
    , title: "Make more of these"
    , complete: false
  });
}).then(function(){
  return Task.create({
    creator: "Admin"
    , title: "Mark this as done"
    , complete: false
  });
});

//Express stuff, handles routing and sending webpages to the client
var app = express();

//everything in "static" can be accessed directly. http://expressjs.com/starter/static-files.html
//i.e. /static/js/jquery.js can be accessed through website-name.com/js/jquery.js
app.use(express.static('static'));


//Creates a route for the root path, which will be main page that we'll use
app.route("/").get(function(req,res,next){
  //Gets the jade file and compiles it
  var mainPage = jade.compileFile(__dirname+"/jade/index.jade");
  //renders the jade with relevant data
  Task.all().then(function(allTasks){
    console.log(allTasks);
    res.end(mainPage({todoList:allTasks}));
	})
});

app.use(bodyParser.urlencoded());
app.route("/create").post(function(req,res,next){
  Task.create(req.body)
  .then(function(newTask){
    console.log(newTask.get());
    res.json(newTask.get());
  });
});

//Tells node to listen on port 8080 for incoming connections
app.listen(8080, function(){
  console.log("Listening on port 8080");
});