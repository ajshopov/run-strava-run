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
var moment = require('moment');

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
var accessTkn;

passport.use(new StravaStrategy({
    clientID: STRAVA_CLIENT_ID,
    clientSecret: STRAVA_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/strava/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(accessToken)
    accessTkn = accessToken
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
    id:req.user.id, 'access_token':accessTkn
  }
  strava.athletes.stats(args,function(err, payload, limits){
    

    var fourWkTotal = payload.recent_run_totals;
    var ytdTotal = payload.ytd_run_totals;
    var allRunTotal = payload.all_run_totals;

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
  // console.log(moment('2017-12-16T12:02:37Z').format('MMM Do, YYYY'))
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

var pbTable = [];
var best400 = 99999;
var bestHalfMile = 99999;
var best1k = 99999;
var best1Mile = 99999;
var best2Mile = 99999;
var best5k = 99999;
var best10k = 99999;

var tempArr;


app.get('/home', ensureAuthenticated, function (req, res) {
  console.log(req.user.id)

  var args = {
    id:req.user.id, 'access_token':accessTkn
  }
  strava.athletes.stats(args,function(err, payload, limits){

    console.log(err)
    console.log(payload)
    console.log(limits)

    var fourWkTotal = payload.recent_run_totals;
    var ytdTotal = payload.ytd_run_totals;
    var allRunTotal = payload.all_run_totals;

    console.log(fourWkTotal)
    console.log(ytdTotal)
    console.log(allRunTotal)


      request(`https://www.strava.com/api/v3/athlete/activities?per_page=100&access_token=${accessTkn}`, function (error, response, body) {
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
          
          strava.activities.get({id:activityIds[i], 'access_token':accessTkn},function(err,payload,limits) {

            console.log(payload.id)

            var bestEffortsLoop = payload.best_efforts;
            // console.log(bestEffortsLoop[0])
            // console.log(bestEffortsLoop[1])
            // console.log(bestEffortsLoop.length)
           console.log('debug?')
            tempArr = [];
  //add id first col
            tempArr.push(payload.id)
            tempArr.push(payload.kudos_count)
            tempArr.push(moment(payload.start_date_local).subtract(payload.utc_offset, 'seconds').format('MMM Do, YYYY'))
            tempArr.push(payload.distance)
            tempArr.push(payload.moving_time)

  // loop through best efforts and take no. seconds, also check if best time
            for (var j = 0; j < bestEffortsLoop.length; j++) {
              tempArr.push(bestEffortsLoop[j].moving_time)
              switch (bestEffortsLoop[j].name){
                case "400m":
                  runBest400(bestEffortsLoop[j]);
                  break;
                case "1/2 mile":
                  runBestHalfMile(bestEffortsLoop[j]);
                  break;
                case "1k":
                  runBest1k(bestEffortsLoop[j]);
                  break;
                case "1 mile":
                  runBest1mil(bestEffortsLoop[j]);
                  break;
                case "2 mile":
                  runBest2mil(bestEffortsLoop[j]);
                  break;
                case "5k":
                  runBest5k(bestEffortsLoop[j]);
                  break;
                case "10k":
                  runBest10k(bestEffortsLoop[j]);
                  break;
              }
            }

  //push to table
            allRuns.push(tempArr);
            //console.log(allRuns)

            if (allRuns.length >= activityIds.length) {
              console.log(pbTable)
              res.render('home', {
                allRuns: allRuns,
                user: req.user._json,
                fourWkTotal: fourWkTotal,
                ytdTotal: ytdTotal,
                allRunTotal: allRunTotal,
                pbTableData: pbTable
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


function runBest400(effort){
  if (effort.moving_time < best400){
    best400 = effort.moving_time;
    pbTable[0] = [0, '400m', effort.moving_time, 'pace', tempArr[0], tempArr[2]];
    console.log(pbTable);
  };
}

function runBestHalfMile(effort){
  if (effort.moving_time < bestHalfMile){
    bestHalfMile = effort.moving_time;
    pbTable[1] = [1, '1/2 mile', effort.moving_time, 'pace', tempArr[0], tempArr[2]];
    console.log(pbTable);
  };
}

function runBest1k(effort){
  if (effort.moving_time < best1k){
    best1k = effort.moving_time;
    pbTable[2] = [2, '1km', effort.moving_time, 'pace', tempArr[0], tempArr[2]];
    console.log(pbTable);
  };
}

function runBest1mil(effort){
  if (effort.moving_time < best1Mile){
    best1Mile = effort.moving_time;
    pbTable[3] = [3, '1 mile', effort.moving_time, 'pace', tempArr[0], tempArr[2]];
    console.log(pbTable);
  };
}

function runBest2mil(effort){
  if (effort.moving_time < best2Mile){
    best2Mile = effort.moving_time;
    pbTable[4] = [4, '2 mile', effort.moving_time, 'pace', tempArr[0], tempArr[2]];
    console.log(pbTable);
  };
}

function runBest5k(effort){
  if (effort.moving_time < best5k){
    best5k = effort.moving_time;
    pbTable[5] = [5, '5km', effort.moving_time, 'pace', tempArr[0], tempArr[2]];
    console.log(pbTable);
  };
}

function runBest10k(effort){
  if (effort.moving_time < best10k){
    best10k = effort.moving_time;
    pbTable[6] = [6, '10km', effort.moving_time, 'pace', tempArr[0], tempArr[2]];
    console.log(pbTable);
  };
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}