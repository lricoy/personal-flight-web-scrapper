var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "scrapperLog.app"});


// Sanity Checks

log.info("Checking the prerequisites...");
var param_url = process.argv[2]; //First param
if(param_url == undefined) {
    log.warn("Url not given");
}

// Check if file exists
fs.exists("outputs/website_links.json", function(exists) {
  if (!exists && param_url == undefined) {
    log.error("File with the website links does not exist and single URL was not specified");
    process.exit();
  }
});

var pageJSON = {
    "scrappedAt": new Date(),
    "generatedAt" : "",
    "origens": "",
    "destinos": "",
    "ofertas": []
};

var extract_page = function(url) {

    log.info("Making the request to the server...");
    request(url, function(error, response, html) {
        if(!error) {

            log.info("Applying RegExp to get the data...");
            var result = html.match(/<script*[\s\S]*?<\/script>/g);

            log.info("Searching for the desired data...", {total: result.length});
            for (var i = result.length - 1; i >= 0; i--) {

                if(result[i].indexOf('ofertas =') > -1) {

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

                    var filename = "./outputs/" + url.substring(url.indexOf('r/')+2, url.length) + ".json";
                    fs.writeFile(filename , JSON.stringify(pageJSON, null, 4), function(err) {
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
};


var main = function() {

    if(!param_url) {
        fs.readFile('./outputs/website_links.json', function read(err, data) {
            if (err) {
                throw err;
            }
            
            var data = JSON.parse(data);

            // Iterating trhougt pagination
            for (var i = data.length - 1; i >= 0; i--) {
                log.info("Starting to iterate headlines from url:" + data.url);

                // Iterating trought headlines
                for (var j = data[i].links.length - 1; j >= 0; j--) {
                    log.info("Starting to extract page", {url:data[i].links[j].link});

                    extract_page(data[i].links[j].link);
                };
            };

        });
    }
    else {
        extract_page(param_url);
    }

};

main();