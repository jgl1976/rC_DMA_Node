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
  clientId : '3MVG9fMtCkV6eLhePwBjNw.lHHuAXPkLhDivF6di2chfNNQq2SNUn9qX0a.phDXUj2TaAvOcJ4BolLqqiSluH',
  clientSecret : '1519327188401123285',
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

  var records = [];
  conn.sobject("Opportunity").describe(function(err, meta) {
    if (err) { return console.error(err); }
    console.log('Label : ' + meta.label);
    console.log('Num of Fields : ' + meta.fields.length);
    records.push(meta.fields);
    res.contentType('application/json');
    res.send(JSON.stringify(records));
  });
  
 /* var records = [];
  conn.query("SELECT Id, Amount FROM Opportunity", function(err, result) {
    if (err) { return console.error(err); }
    console.log("total : " + result.totalSize);
    console.log("fetched : " + result.records.length);
    console.log("done ? : " + result.done);
    records.push(result.records);
    res.contentType('application/json');
    res.send(JSON.stringify(records));
    if (!result.done) {
      // you can use the locator to fetch next records set.
      // Connection#queryMore()
      console.log("next records URL : " + result.nextRecordsUrl);
    }
  });*/
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

    res.redirect('/index');

  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
