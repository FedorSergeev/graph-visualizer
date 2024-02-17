const express = require('express');

const app = express();

const statOpt = { maxAge: 10000 };

app.use(express.static(__dirname + '/src/web', statOpt))
app.use('/lib', express.static(__dirname + '/src/lib', statOpt))

var server = app.listen(3000, function () {
	console.log(new Date(), 'app started at ');
	console.log(server.address());
});
