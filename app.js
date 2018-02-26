var express = require('express')
var app = express()
var strava = require('strava-v3');

strava.athletes.get({id:26705652},function(err,payload,limits) {
    //do something with your payload, track rate limits
    console.log(err)
    console.log(payload)
    console.log(limits)
});


app.get('/', function (req, res) {
  res.send('Hello World')
})
 
app.listen(3000)