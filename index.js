var express = require('express');
var app = express();
var jsforce = require('jsforce');

app.set('port', (process.env.PORT || 5000));
app.use('/public', express.static(__dirname + '/public'));
app.set('view engine', 'jade');

var accessToken = "";
var refreshToken = "";
var instanceUrl = "";

//
// OAuth2 client information can be shared with multiple connections.
//
var oauth2 = new jsforce.OAuth2({
  // you can change loginUrl to connect to sandbox or prerelease env.
  // loginUrl : 'https://test.salesforce.com',
  clientId : '3MVG9A2kN3Bn17hvZc9nekjyHNoZI732S5MWbq2kMdJDrpKZR5jjym37eELSpIoEUPzYQaDtjI7sD_GlTlCbk',
  clientSecret : '4281366282980209317',
  redirectUri : 'https://dma-node.herokuapp.com/oauth2/callback'
});

app.get('/', function(request, res) { /// root get index template
  res.render('index', {}); /// render index.jade
});

app.get('/login', function(request, res) {/// login to sales force
  res.redirect(oauth2.getAuthorizationUrl({ scope : 'api id web' })); /// oauth2 salesforce
});

app.get('/index', function(request, res) {/// Onced logged in get query stuff
  var conn = new jsforce.Connection({
    instanceUrl : instanceUrl,
    accessToken : accessToken
  });

  var records = "";
  var arrayrec = [];

  conn.sobject("Account").describe(function(err, meta) {
    if (err) { return console.error(err); }
    var items = meta['fields'];
    for(var i=0, l = items.length; i < l; i++){
      if(i!=0){
        records += ",";
      }
      records += ""+items[i].name+"";
      arrayrec.push(items[i].name);
    }
      var jsonresults = [];
        conn.query("SELECT "+records+" FROM Account", function(err, result) {
          if (err) { return console.error(err); }
          console.log("total : " + result.totalSize);
          console.log("fetched : " + result.records.length);
          console.log("done ? : " + result.done);
          jsonresults.push(result.records);
          res.contentType('application/json');
          res.send(jsonresults);
          if (!result.done) {
            // you can use the locator to fetch next records set.
            // Connection#queryMore()
            console.log("next records URL : " + result.nextRecordsUrl);
          }
        })

  });
});

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
    accessToken = conn.accessToken;
    refreshToken = conn.refreshToken;
    instanceUrl = conn.instanceUrl;
    res.redirect('/index');/// redirect to index 
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
