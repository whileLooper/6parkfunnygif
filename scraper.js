const cheerio = require('cheerio');
const _ = require('underscore');
const request = require("request");

export const scraper = () => {
  request(
    {
      url: 'https://site.6parker.com/enter1/index.php',
      method: 'GET',
    },
    (error, response, html) => {
      if (response && response.statusCode != 200) {
        console.log("Cannot make the Request");
        return null;
      }

      if (!html) {
        console.log("Did not get response.");
        return null;
      }

      var $ = cheerio.load(html);
      console.log($);
    }
  )
}
