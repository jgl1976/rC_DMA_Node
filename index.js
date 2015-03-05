var express = require('express');
var app = express();
var jsforce = require('jsforce');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');

app.get('/test', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
})

app.get('/', function(request, response) {

	var conn = new jsforce.Connection();
	conn.login('john.levis+findev@roundcorner.com', 'John_5050', function(err, res) {
	  if (err) {
	  	response.send(err);
	  }//logged in carry on
	  conn.query('SELECT Id, Name FROM Account WHERE Name = "John Doe"', function(err, res) {
	    if (err) {
	     response.send(err); 
	 	}

		response.send(res);	  

	  });///end query
	});
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
