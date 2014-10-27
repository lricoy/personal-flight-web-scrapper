var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "scrapperLog.app"});

var express = require('express'),
    restful = require('node-restful'),
    mongoose = restful.mongoose;
    bodyParser = require('body-parser')
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({extended: false}));
app.set('port', process.env.PORT || 3000);

mongoose.connect('mongodb://app:app123qwe@ds047940.mongolab.com:47940/melhores-destinos');

var Oferta = mongoose.Schema(
 { 
    name: String,
    scrappedAt: String,
    generatedAt: String,
    origens: Array,
    destinos: Array,
    ofertas: [ 
    {
        origem: String,
        destino: String,
        preco: String,
        data_ida: String,
        data_volta: String,
        empresa: String
    } ]
 }
);

var Resource = app.resource = restful.model('Oferta', Oferta)
  .methods(['get']);

Resource.register(app, '/ofertas');

app.listen(app.get('port'), function() {
  log.info('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;