var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "scrapperLog.site_mapper"});


log.info("Checking the Params...");
var url = process.argv[2]; //First param
if(url == undefined) {
    console.log("Url not given");
    process.exit();
}

// Check if file exists
fs.exists("outputs", function(exists) {
  if (!exists) {
    fs.mkdir("outputs");
  }
});

var headlines = [];
var limit = 1;
var count = 0;

var scrapLinks = function (url, check_complete) {

    if(count >= limit) return;
    count++;

    log.info("Making the request to the server...");
    request(url, function(error, response, html) { 
        if(!error) {
            $ = cheerio.load(html);

            log.info("Gettin page headlines", {url: url});
            var page_headlines = [];
            $('.entry-title a').each(function(i, link) {
                page_headlines.push( {
                   title: $(this).attr('title'),
                   link: $(this).attr('href') 
                });
            });

            log.info("Pushing data to main list");
            headlines.push({url: url, links:page_headlines});

            log.info("Checking if there is more pages to scrap");
            var navigation_link = $('#nav-below .nav-previous a');

            if(navigation_link.length > 0 && count != limit) {
                scrapLinks(navigation_link.attr('href'));
            }
            else {

                log.info("Scrapping complete. Going to write JSON to file now");

                fs.writeFile("outputs/website_links.json", JSON.stringify(headlines, null, 4), function(err) {
                    if(err) {
                      log.error("An error ocurred while saving the JSON", {err: err});
                    } else {
                      log.info("JSON saved");
                    }
                }); 
            }

        }
    });

};

scrapLinks(url);