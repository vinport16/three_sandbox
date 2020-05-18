var fs = require('fs');
var PNG = require("pngjs").PNG;
var express = require('express');
var app = express();
var http = require('http').createServer(app);
port = process.env.PORT || 3000;

http.listen(port);
console.log("running on port " + port);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/page.html');
});

app.get('/three.js', function(req, res){
  res.sendFile(__dirname + '/node_modules/three/three.js');
});

app.get('/hexagons.js', function(req, res){
  res.sendFile(__dirname + '/hexagons.js');
});

app.get('/black_star.png', function(req, res){
  res.sendFile(__dirname + '/star.png');
});

app.get('/script_planets.js', function(req, res){
  res.sendFile(__dirname + '/script_planets.js');
});

app.get('/script_terrain.js', function(req, res){
  res.sendFile(__dirname + '/script_terrain.js');
});

app.get('/script_models.js', function(req, res){
  res.sendFile(__dirname + '/script_models.js');
});

var map = [];

fs.createReadStream("dog_eyes.png").pipe(new PNG()).on('parsed',function(){
  for(var y = 0; y < this.height; y++){
    map.push([]);
    for(var x = 0; x < this.width; x++){
      let idx = (this.width * y + x) << 2;
      let height = ( this.data[idx] + this.data[idx+1] + this.data[idx+2] ) / (3 * 100/255);
      map[y].push(height);
    }
  }
  console.log("map loaded");
});

app.get("/map.js", function(req, res){
  let def = "var map = [";

  for(var y = 0; y < map.length; y++){
    def += "[";
    def += map[y].join(", ");
    def += "], ";
  }

  def += "]";
  res.send(def);
});






