//Some live feedback to tell you that the app is running
console.log("App started!");

//load the libraries we need at the start
var express = require("express");
var jade  = require("jade");

//Express stuff, handles routing and sending webpages to the client
var app = express();

//everything in "static" can be accessed directly. http://expressjs.com/starter/static-files.html
//i.e. /static/js/jquery.js can be accessed through website-name.com/js/jquery.js
app.use(express.static('static'));

//Gets the jade file and parses it

//Creates a route for the root path, which will be main page that we'll use
app.route("/").get(function(req,res,next){
  var mainPage = jade.compileFile(__dirname+"/jade/index.jade");
	res.end(mainPage({
  	todoList: [{id: 1, title:"Add more items to this"}
  	, {id: 2, title: "Mark this as checked"}]
	}));
});

//Tells node to listen on port 8080 for incoming connections
app.listen(8080, function(){
  console.log("Listening on port 8080");
});