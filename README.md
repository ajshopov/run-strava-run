# Running Man

:runner: :walking: :runner: :walking: :runner:


The [Running Man](http://therunningman.herokuapp.com/) is an app for the running enthusiast that uses data from Strava to provide a user-friendly summary of your personal best times. 

### Brief

General Assembly WDI Project #4. Bring together all you've learnt, explore new stacks, try out libraries, different frameworks and APIs you haven't used yet... embark on something big!

### Problem

Strava allows users to track their running and cycling activities via GPS, save their times, view statistical data and compare with other users. As a numbers person and an avid runner, I find the stats are fun and have helped me improve. However, Strava doesn't display 'Best Efforts' in a user-friendly manner, and if I hit my "2nd best estimated 2 mile effort", I can only find my best effort (or 3rd best for that matter) by manually searching through past activities.Any Strava user will immediately see the problem here as your activity database can build up quite quickly!

![best effort strava](https://github.com/ajshopov/run-strava-run/blob/master/public/images/best_effort_strava.png)

### Solution

My idea was use the Strava API to build a UI that allows users to see and analyse their run data in a simple and effective way.

The landing page redirects to the Strava Login page to log in to your profile via OAuth 2.0 authentication. (This was also the design inspiration for the landing page).

![Screenshot Home Page](https://github.com/ajshopov/run-strava-run/blob/master/public/images/splash.png)

The dashboard shows a profile summary for the user and a table of their personal best time and pace for a range of distances. Below that is a detailed summary of all activities where you can sort and filter as you please.

### Techs used

- express
- node
- strava api
- passport-strava (courtesy of [millsy](https://github.com/millsy/passport-strava))
- DataTables jQuery plug-in

![Dashboard](https://github.com/ajshopov/run-strava-run/blob/master/public/images/dashboard.png)

