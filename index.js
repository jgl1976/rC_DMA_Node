var express = require('express');
var app = express();
var jsforce = require('jsforce');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');

//
// OAuth2 client information can be shared with multiple connections.
//
var oauth2 = new jsforce.OAuth2({
  // you can change loginUrl to connect to sandbox or prerelease env.
  // loginUrl : 'https://test.salesforce.com',
  clientId : '3MVG9fMtCkV6eLhePwBjNw.lHHuAXPkLhDivF6di2chfNNQq2SNUn9qX0a.phDXUj2TaAvOcJ4BolLqqiSluH',
  clientSecret : '1519327188401123285',
  redirectUri : 'https://dma-node.herokuapp.com/oauth2/callback'
});


app.get('/test', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
})

//
// Pass received authz code and get access token
//
app.get('/oauth2/callback', function(req, res) {
  var conn = new jsforce.Connection({ oauth2 : oauth2 });
  var code = req.param('code');
  conn.authorize(code, function(err, userInfo) {
    if (err) { return console.error(err); }
    // Now you can get the access token, refresh token, and instance URL information.
    // Save them to establish connection next time.
    console.log(conn.accessToken);
    console.log(conn.refreshToken);
    console.log(conn.instanceUrl);
    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);
    res.render('index', { title: userInfo.organizationId, message: userInfo.id});
    // ...
  });
});

app.get('/', function(request, res) {
  res.redirect(oauth2.getAuthorizationUrl({ scope : 'api id web' }));
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
