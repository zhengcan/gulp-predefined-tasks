var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.redirect('/index.html')
})

app.get('/index.html', function (req, res) {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Backend</title>
      </head>
      <body>
        <div id="root"></div>
        <!--
        <script src="js/react-with-addons.js"></script>
        <script src="js/react-dom.js"></script>
        -->
        <script src="index.bundle.js"></script>
        <!--
        <script src="appWithoutReact.js"></script>
        <script>
          var lib = new appWithoutReact.default();
          console.log(lib.sayHello('aaaa'));
        </script>
        -->
        <iframe src="/info" width="800" height="400"></iframe>
      </body>
    </html>
  `);
});

app.get('/info', function (req, res) {
  delete req.headers.cookie
  res.json(req.headers)
});

app.get('/index.bundle.js', function (req, res) {
  res.send('document.getElementById("root").innerHTML = "Hello from Backend Server.";')
})

app.get('/js/:name', function (req, res) {
  var options = {
    root: __dirname + '/js/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  var fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
  });
})

app.listen(9000, function () {
  console.log('Access: http://localhost:9000/');
})
