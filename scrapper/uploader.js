var fs       = require('fs');
var bunyan   = require('bunyan');
var log = bunyan.createLogger({name: "scrapperLog.uploader"});


var mongoose = require('mongoose');
mongoose.connect('mongodb://app:app123qwe@ds047940.mongolab.com:47940/melhores-destinos');

var Oferta = mongoose.model('Oferta',
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

var count = 1;
var total = 0;

log.info("Cleaning existing data");

var check_process = function(count, total) {
    if(count == total) { 
        log.info("Upload finished");
        process.exit(); 
    }
};

var upload_data = function() {
    log.info("Reading directory files");
    fs.readdir('outputs', function(err, files) {

        log.info("Reading each files");

        for (var i = files.length - 1; i >= 0; i--) {

            log.info("Reading: " + files[i]);

            // Sanity check | Will only save the offers
            if(files[i].indexOf('.html.json') > -1) {
                
                log.info("Parsing data from file");

                var json_data = fs.readFileSync("./outputs/"+files[i]);
                var oferta = Oferta(JSON.parse(json_data));
                oferta.name = files[i];

                oferta.save(function(err, saved_oferta) {
                    if(!err) {
                        log.info('Oferta saved to DB!');
                    }

                    check_process(++count, files.length);
                });
            }
        };
    });
};

var main = function() {

    // Remove all the current docs
    Oferta.remove().exec();

    upload_data();
        
};

main();