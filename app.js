var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "scrapperLog"});


log.info("Checking the Params...");
var url = process.argv[2]; //First param
if(url == undefined) {
    console.log("Url not given");
    process.exit();
}

var pageJSON = {
    "scrappedAt": new Date(),
    "generatedAt" : "",
    "origens": "",
    "destinos": "",
    "ofertas": []
};


log.info("Making the request to the server...");
request(url, function(error, response, html) {
    if(!error) {

        log.info("Applying RegExp to get the data...");
        var result = html.match(/<script*[\s\S]*?<\/script>/g);

        log.info("Searching for the desired data...", {total: result.length});
        for (var i = result.length - 1; i >= 0; i--) {

            if(result[i].indexOf('ofertas') > -1) {

                log.info("Cleaning the data...", {foundAt: i});
                var clean_data = result[i].replace(/<script>/, "");
                clean_data = clean_data.replace("</script>", "");

                log.info("Evaluating and loading the data...", {length: clean_data.length});
                eval(clean_data);

                log.info("Transversing the data into the new format...");

                pageJSON.generatedAt = dataHoraGeracao;
                pageJSON.origens     = origens;
                pageJSON.destinos    = destinos;

                ofertas.forEach(function(oferta) {
                    pageJSON.ofertas.push({
                        "origem"    : oferta[0],
                        "destino"   : oferta[1],
                        "preco"     : oferta[2],
                        "data_ida"  : oferta[3],
                        "data_volta": oferta[4],
                        "empresa"   : oferta[5]
                    });
                });

                log.info("Saving the new data into a file");

                fs.writeFile("myJson.json", JSON.stringify(pageJSON, null, 4), function(err) {
                    if(err) {
                      log.error("An error ocurred while saving the JSON", {err: err});
                    } else {
                      log.info("JSON saved");
                    }
                }); 

            }

        };
    }
});