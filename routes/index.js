var express = require('express');
var router = express.Router();

// scraper
const cheerio = require('cheerio');
const _ = require('lodash');
const request = require("request");
const iconv = require('iconv-lite');
const BASE_URL = 'https://site.6parker.com/enter1/';

/* GET home page. */
router.get('/', async function (req, res, next) {

  const { postLinks, postTitles } = await scraper(BASE_URL);
  setTimeout(() => {
    const imageLinkList = scraperImages(postLinks);
    setTimeout(() => {
      const content = '<link rel="stylesheet" type="text/css" href="stylesheets/style.css" />' + imageLinkList.toString();
      res.render('index', { content: content });
    }, 10000);
  }, 1000);
});

async function scraper(BASE_URL) {
  let postLinks = [];
  let postTitles = [];

  request(
    {
      url: BASE_URL + 'index.php',
      method: 'GET',
      gzip: true,
      encoding: null,
      headers: {
        'Content-Type': 'text/html; charset=gbk',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8,zh-CN;q=0.7,zh;q=0.6,zh-TW;q=0.5',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
      },
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

      var $ = cheerio.load(iconv.decode(html, 'gb2312'));

      // get first page post list
      const postList = $('#d_list > ul > li');

      // get each post list
      for (let key in postList) {
        if (Number(key) < 10) {
          let title = postList[key].children[0].children[0].data;
          postLinks.push(BASE_URL + postList[key].children[0].attribs.href);
          postTitles.push(title.toString('utf-8'));
        }
      }
    }
  )

  return { postLinks, postTitles };
}

function scraperImages(links) {
  let imageLinkList = [];
  if (links && links.length > 0) {
    links.forEach((link, i) => {
      request(
        {
          url: link,
          method: 'GET',
          gzip: true,
          encoding: null,
          headers: {
            'Content-Type': 'text/html; charset=gbk',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8,zh-CN;q=0.7,zh;q=0.6,zh-TW;q=0.5',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
          },
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
          var $ = cheerio.load(iconv.decode(html, 'gb2312'));
          // const imageList = $('td.show_content > pre img');

          // for (let key in imageList) {
          //   if (imageList[key].attribs && imageList[key].attribs.src) imageLinkList.push(imageList[key].attribs.src);
          // }
          const centerContent = $('td.show_content > pre > center');
          imageLinkList.push(centerContent.html());
        }
      )
    });
  }
  console.log(imageLinkList);
  return imageLinkList;
}

module.exports = router;
