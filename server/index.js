const express = require('express');
const path = require('path');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var session = require('express-session');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
  "547628531152-41noksmngdceu7lva0lkv07hqsijetp0.apps.googleusercontent.com",
  "6zvK7SXy-klJThdQtbSdWVkk",
  "https://cal-todos.herokuapp.com/oauth2callback"
);

const app = express();
const PORT = process.env.PORT || 5000;

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));
app.use(session({
  secret: 'cal todos session secret'
}));

// Answer API requests.
app.get('/api', function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send('{"message":"Hello from Cal Todos!"}');
});

app.get('/oauth', function (req, res) {

  var scopes = [
    'https://www.googleapis.com/auth/calendar'
  ];

  if (req.query.client_id.toString().trim() === 'cal-todos-alexa-skill') {
    var url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',

      // If you only need one scope you can pass it as a string
      scope: scopes,

      // Optional property that passes state parameters to redirect URI
      // state: { foo: 'bar' }
    });

    req.session.state = req.query.state;

    res.redirect(url);
  } else {
    res.redirect('https://cal-todos.herokuapp.com');
  }
});

app.get('/oauth2callback', function (req, res) {


  // oauth2Client.getToken(req.query.code, function (err, tokens) {
  // Now tokens contains an access_token and an optional refresh_token. Save them.
  var redirectUrl = "https://pitangui.amazon.com/api/skill/link/M16QAK3VJ2Q2F1?vendorId=M16QAK3VJ2Q2F1&state=" + req.session.state + "&code=" + req.query.code;
  res.redirect(redirectUrl);

  // if (!err) {
  //   oauth2Client.setCredentials(tokens);
  // }

  // });

});

app.post('/getTokens', function (req, res) {

  var respString = '';

  req.on('data', function (data) {
    respString += data;
  });

  req.on('end', function () {
    var rawParams = decodeURIComponent(respString);
    var authParams = rawParams.split('&').map(function (i) {
      return i.split('=');
    }).reduce(function (memo, i) {
      memo[i[0]] = i[1] == +i[1] ? parseFloat(i[1], 10) : decodeURIComponent(i[1]);
      return memo;
    }, {});

    var oauth2Client = new OAuth2(
      "547628531152-41noksmngdceu7lva0lkv07hqsijetp0.apps.googleusercontent.com",
      "6zvK7SXy-klJThdQtbSdWVkk",
      "https://cal-todos.herokuapp.com/oauth2callback"
    );
    
    oauth2Client.getToken(authParams.code, function (err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token.Save them.
      res.send(JSON.stringify(tokens));
    });
  });

  //   {
  //     "access_token":"Atza|IQEBLjAsAhRmHjNgHpi0U-Dme37rR6CuUpSR...",
  //     "token_type":"bearer",
  //     "expires_in":3600,
  //     "refresh_token":"Atzr|IQEBLzAtAhRPpMJxdwVz2Nn6f2y-tpJX2DeX..."
  //  }
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}!`);
});