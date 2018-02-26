var express = require('express')
var app = express()
const PORT = process.env.PORT || 3000;
var strava = require('strava-v3');
var request = require('request');
let cors = require('cors')
app.use(cors());

var STRAVA_ACCESS_TOKEN = process.env.STRAVA_ACCESS_TOKEN;
var STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID
var STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET
var STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'))

var appData;


strava.oauth.getRequestAccessURL({STRAVA_ACCESS_TOKEN, STRAVA_CLIENT_SECRET, STRAVA_CLIENT_ID, STRAVA_REDIRECT_URI})



// request(`https://www.strava.com/api/v3/athletes/26705652?access_token=${STRAVA_ACCESS_TOKEN}`, function (error, response, body) {
//   // console.log('error:', error); // Print the error if one occurred
//   // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//   // console.log('body:', body); // Print the HTML for the Google homepage.
//   console.log(JSON.parse(body))
//   appData = JSON.parse(body)
// });



app.get('/', function (req, res) {
  res.render('splash')
})


app.get('/home', function (req, res) {
  strava.athletes.get({id: 26705652},function(err,payload,limits) {
    //do something with your payload, track rate limits
    console.log(err)
    console.log(limits)
    console.log(payload)
    appData = payload
  });


  res.render('home', {
    appData: appData
  })
  // res.json(appData)
})
 

app.listen(PORT, function(){
  console.log(`listening on port ${PORT}`);
}); 