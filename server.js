// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var googleImages = require("google-images")
var client = new googleImages('015217228863570307319:8nvm84psmcc', 'AIzaSyB6IjqLhUlwKs0kQlAYPcbo3WS2dGxDa7Q');

var searches = null;

var MongoClient = require('mongodb').MongoClient;


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/api/imagesearch/:term", function (request, response) {
  searches.insertOne({ term: request.params.term, when: new Date().toString() });
  var page = request.query.offset || 1;
  client.search(request.params.term, { page })
    .then(imgs => {
      response.send(imgs.map(img => {
        return {
          url: img.url,
          snippet: img.description,
          thumbnail: img.thumbnail.url,
          context: img.parentPage
        };
      }));
    });
});

app.get('/api/latest/imagesearch', function (request, response) {
  searches.find().toArray(function (err, docs) {
    response.send(docs.map(doc => { return { term: doc.term, when: doc.when } }));
  });
});

// listen for requests :)
MongoClient.connect(process.env.MONGO_URL, function (err, db) {
  console.log("Connected correctly to server");
  searches = db.collection('searches');
  var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
  });
});
