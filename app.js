var express = require('express')
var expressLayouts = require('express-ejs-layouts');
var passport = require('passport');
// var util = require('util')
var StravaStrategy = require('passport-strava-oauth2').Strategy;
var app = express();
// const PORT = process.env.PORT || 3000;
var strava = require('strava-v3');
var request = require('request');
// let cors = require('cors')
// app.use(cors());

var STRAVA_ACCESS_TOKEN = process.env.STRAVA_ACCESS_TOKEN;
var STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID
var STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET
var STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressLayouts);
// var cookie = require('cookie');
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

var appData;

passport.use(new StravaStrategy({
    clientID: STRAVA_CLIENT_ID,
    clientSecret: STRAVA_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/strava/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Strava profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Strava account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));




// strava.oauth.getRequestAccessURL({STRAVA_ACCESS_TOKEN, STRAVA_CLIENT_SECRET, STRAVA_CLIENT_ID, STRAVA_REDIRECT_URI})


app.get('/', function (req, res) {
  res.render('splash', { user: req.user })
})


 
// GET /auth/strava
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Strava authentication will involve
//   redirecting the user to strava.com.  After authorization, Strava
//   will redirect the user back to this application at /auth/strava/callback

app.get('/auth/strava',
  passport.authenticate('strava', { scope: ['public'] }),
  function(req, res){
    // The request will be redirected to Strava for authentication, so this
    // function will not be called.
  });

// GET /auth/strava/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/strava/callback', 
  passport.authenticate('strava', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/home');
  });



app.get('/old_home', ensureAuthenticated, function (req, res) {
  console.log(req.user._json)
  // strava.athletes.get({id: 26705652},function(err,payload,limits) {
  //   //do something with your payload, track rate limits
  //   console.log(err)
  //   console.log(limits)
  //   console.log(payload)
  //   appData = payload
  // });
  var args = {
    id:req.user.id, 'access_token':STRAVA_ACCESS_TOKEN
  }
  strava.athletes.stats(args,function(err, payload, limits){
    var fourWkTotal = payload.recent_run_totals;
    var ytdTotal = payload.ytd_run_totals;
    var allRunTotal = payload.all_run_totals;

    console.log(fourWkTotal)
    console.log(ytdTotal)
    console.log(allRunTotal)

    res.render('home', { 
      user: req.user._json,
      fourWkTotal: fourWkTotal,
      ytdTotal: ytdTotal,
      allRunTotal: allRunTotal
      })


  })

  // console.log(req.user)
  // res.json(appData)
})



app.get('/one_act', ensureAuthenticated, function(req,res){
  var args = {
    id:1424416003, 'access_token':STRAVA_ACCESS_TOKEN
  }
  strava.activities.get(args,function(err,payload,limits) {
    // console.log(err)
    // console.log(payload)
    // console.log(limits)
    //do something with your payload, track rate limits 
    // res.json(payload)
    // console.log(payload.best_efforts)
    var bestData = payload.best_efforts
    var dataSet = [];
    for (var i = 0; i < bestData.length; i++) {
      dataSet.push([bestData[i].name, bestData[i].moving_time])
      console.log(bestData[i].moving_time)
      console.log(dataSet)
    }
    
    res.render('activity', {
      dataSet: dataSet
    })

  });
  // res.json(req.user)
})


app.get('/home', ensureAuthenticated, function (req, res) {

  var args = {
    id:req.user.id, 'access_token':STRAVA_ACCESS_TOKEN
  }
  strava.athletes.stats(args,function(err, payload, limits){
    var fourWkTotal = payload.recent_run_totals;
    var ytdTotal = payload.ytd_run_totals;
    var allRunTotal = payload.all_run_totals;



      request(`https://www.strava.com/api/v3/athlete/activities?per_page=100&access_token=${STRAVA_ACCESS_TOKEN}`, function (error, response, body) {
        // console.log('error:', error); // Print the error if one occurred
        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.
        // console.log(JSON.parse(body))
        // res.json(JSON.parse(body))
        appData = JSON.parse(body)

        console.log(appData.length)
        var activityIds = [];
        for (var i = 0; i < appData.length; i++) {
          if (appData[i].type == "Run") {
            activityIds.push(appData[i].id);
          }
        }
        // res.json(activityIds)

        console.log(activityIds)
        console.log(activityIds.length)
        console.log(activityIds[0])
        console.log(typeof(activityIds[0]))

        var allRuns = [];
        for (var i = 0; i < activityIds.length; i++) {
          
          strava.activities.get({id:activityIds[i], 'access_token':STRAVA_ACCESS_TOKEN},function(err,payload,limits) {
            // console.log(err)

            console.log(payload.id)
            // console.log(payload.best_efforts)
            var bestLoop = payload.best_efforts;
            // console.log(bestLoop[0])
            // console.log(bestLoop[1])
            // console.log(bestLoop.length)

            // bests4run.push([bestLoop[0].name, bestLoop[0].moving_time])
            console.log('debug?')
            var tempArr = [];
            tempArr.push(payload.id)
            // console.log(limits)
            //do something with your payload, track rate limits

            for (var j = 0; j < bestLoop.length; j++) {
              tempArr.push(bestLoop[j].moving_time)
            }
            // bests4run.push(tempArr)
            // console.log(bests4run)
            allRuns.push(tempArr);
            //console.log(allRuns)
            if (allRuns.length >= activityIds.length) {
              res.render('home', {
                allRuns: allRuns,
                user: req.user._json,
                fourWkTotal: fourWkTotal,
                ytdTotal: ytdTotal,
                allRunTotal: allRunTotal
              })
            }

          });

        };


      });
  })
})


app.get('/logout', function(req, res){
  // strava.oauth.deauthorize({id:26705652}, function(err, payload, limits){});

  req.logout();
  res.redirect('/');
});

  // fetch('https://www.strava.com/oauth/authorize', function(req, res){
  //       res.json({
  //         query_string_client_id: 23601,
  //         redirect_uri: 'http://localhost/',
  //         response_type: 'code',
  //         approval_prompt: 'force'
  //       })
  // })

app.listen(3000, function(){
  console.log(`listening on port 3000`);
}); 






function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}