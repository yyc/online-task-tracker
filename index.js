//Some live feedback to tell you that the app is running
console.log("App started!");

//load the libraries we need at the start
var express = require("express");
var jade  = require("jade");
var Sequelize = require("sequelize");
var bodyParser = require("body-parser");

var sequelize = new Sequelize("sqlite://"+__dirname+"/db/database.sqlite");

var User = sequelize.define("users",{
  id: {
    type: Sequelize.INTEGER
    , primaryKey: true
    , field: "fb_id"
  }
  , name: {
    type: Sequelize.STRING
    , field: "name"
  }
})
User.sync({force:true}).then(function(){
  return User.create({
    id:153080620724
    , name: "Donald Trump"
  });
});


var Task = sequelize.define("tasks",{
  id: {
    type: Sequelize.INTEGER
    , primaryKey: true
    , autoIncrement: true
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
Task.belongsTo(User);

var List = sequelize.define("lists",{
  id: {
    type: Sequelize.STRING
    , primaryKey: true
  }
  , title:{
    type: Sequelize.STRING
    , field: "title"
    , allowNull: true
  }
});
List.hasMany(Task, {as: "Tasks"});
List.sync({force:true});
Task.sync({force:true});
/*
.then(function(){
  return Task.create({
    title: "Make more of these"
    , complete: false
  });
  }).then(function(){
  return Task.create({
    title: "Mark this as done"
    , complete: false
  });
});
*/


//Express stuff, handles routing and sending webpages to the client
var app = express();

//everything in "static" can be accessed directly. http://expressjs.com/starter/static-files.html
//i.e. /static/js/jquery.js can be accessed through website-name.com/js/jquery.js
app.use(express.static('static'));

app.route("/").get(function(req,res,next){
  res.end("<h1>Hello world!</h1> There's nothing here, you can access the todo lists via /listName");
});

//Creates a route for the root path, which will be main page that we'll use
app.route("/:listId").get(function(req,res,next){
  //Gets the jade file and compiles it
  var mainPage = jade.compileFile(__dirname+"/jade/index.jade");
  //renders the jade with relevant data
  List.findOrCreate({where:{id: req.params.listId}, defaults:{id: req.params.listId}})
  .then(function(todo){
    return todo[0].getTasks({include:User});
  })
  .then(function(allTasks){
    console.log(allTasks);
    res.end(mainPage({todoList:allTasks}));
	})
});

app.use(bodyParser.urlencoded());
app.route("/:listId/create").post(function(req,res,next){
  User.findOrCreate({where:{id: req.body.creator.id},
  defaults: req.body.creator})
  .then(function(user){
    return Task.create({title: req.body.title, userId: req.body.creator.id});
  })
  .then(function(newTask){
    List.findOrCreate({where:{id: req.params.listId}, defaults:{id: req.params.listId}})
    .then(function(todoList){ // todoList returns an [instance,success] array
      todoList[0].addTasks(newTask);
      res.json(newTask.get());    
    });
  });
});

//Tells node to listen on port 8080 for incoming connections
app.listen(8080, function(){
  console.log("Listening on port 8080");
});