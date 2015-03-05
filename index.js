var express = require('express');
var app = express();
var jsforce = require('jsforce');

// Config
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');

app.get('/test', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
})

// Routes
app.get('/', function (req, res) {
    var conn = new jsforce.Connection();

    conn.login('john.levis+findev@roundcorner.com', 'John_5050', function (errors, result) {
        if (errors) {
            console.log('[login] errors', '' + errors)
            res.status(500);
            res.send('' + errors);
            return;
        } else {
            console.log('[login] result', result)            
        }

        // Do stuff
        conn.query('SELECT Id, Name FROM Account', function (errors, result) {
            if (errors) {
                console.log('[query] errors', '' + errors)
                res.status(500);
                res.send('' + errors);
            } else {
                console.log('[query] result', result)
                res.status(200);
                res.send(JSON.stringify(result));
            }
        }); ///end query
    });
});

app.listen(app.get('port'), function () {
    console.log("Node app is running at localhost:" + app.get('port'));
});
