var createError = require("http-errors");
var rp = require("request-promise");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var fs = require("fs");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var router = express.Router();
var app = express();

const cheerio = require("cheerio");
const _ = require("lodash");
const request = require("request");
const iconv = require("iconv-lite");
const BASE_URL = "https://site.6parker.com/enter1/";



// view engine setup
// app.set("views", path.join(__dirname, "views"));
app.set("views", path.join(__dirname, "reactViews"));
app.set("view engine", "jsx");
app.engine('jsx', require('express-react-views').createEngine());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

const options = {
  url: BASE_URL + "index.php",
  method: "GET",
  gzip: true,
  encoding: null,
  headers: {
    "Content-Type": "text/html; charset=gbk",
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language":
      "en-US,en;q=0.9,ja;q=0.8,zh-CN;q=0.7,zh;q=0.6,zh-TW;q=0.5",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36"
  }
};

var contentData = {};

init(options);

function init(options) {
  console.log('initiating...');
  let postLinks = [];
  let contents = undefined;
  rp(options)
    .then(function (html) {
      return new Promise(function (resolve, reject) {
        if (!html) {
          console.log("Did not get response.");
          return null;
        }

        var $ = cheerio.load(iconv.decode(html, "gb2312"));
        // get first page post list
        const postList = $("#d_list > ul > li");

        // get each post list
        for (let key in postList) {
          if (Number(key) < 5) {
            let title = postList[key].children[0].children[0].data;
            postLinks.push(BASE_URL + postList[key].children[0].attribs.href);
          }
        }

        resolve(postLinks);
      })
    })
    .then(function (res) {
      contents = scraperImages(res);
      setTimeout(() => {
        fs.writeFile('file.json', JSON.stringify(contentData), (err) => {  
          if (err) throw err;
          console.log('Data written to file');
        });
      }, 3000);
    });
};

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

async function scraper(BASE_URL) {
    let postLinks = [];
    let postTitles = [];
    request(
      {
        url: BASE_URL + "index.php",
        method: "GET",
        gzip: true,
        encoding: null,
        headers: {
          "Content-Type": "text/html; charset=gbk",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language":
            "en-US,en;q=0.9,ja;q=0.8,zh-CN;q=0.7,zh;q=0.6,zh-TW;q=0.5",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36"
        }
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

        var $ = cheerio.load(iconv.decode(html, "gb2312"));

        // get first page post list
        const postList = $("#d_list > ul > li");

        // get each post list
        for (let key in postList) {
          if (Number(key) < 5) {
            let title = postList[key].children[0].children[0].data;
            postLinks.push(BASE_URL + postList[key].children[0].attribs.href);
            postTitles.push(title.toString("utf-8"));
          }
        }
      }
    );

    return (postLinks);
}

function scraperImages(links) {
  // return new Promise((resolve, reject) => {

    let imageLinkList = [];
    if (links && links.length > 0) {
      links.forEach((link, i) => {
        request(
          {
            url: link,
            method: "GET",
            gzip: true,
            encoding: null,
            headers: {
              "Content-Type": "text/html; charset=gbk",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
              "Accept-Encoding": "gzip, deflate, br",
              "Accept-Language":
                "en-US,en;q=0.9,ja;q=0.8,zh-CN;q=0.7,zh;q=0.6,zh-TW;q=0.5",
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36"
            }
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
            var $ = cheerio.load(iconv.decode(html, "gb2312"));
            // const imageList = $("td.show_content > pre img");
  
            // for (let key in imageList) {
            //   if (imageList[key].attribs && imageList[key].attribs.src)
            //     imageLinkList.push(imageList[key].attribs.src);
            // }
            const centerContent = $('td.show_content > pre');
            imageLinkList.push(centerContent.html());
            contentData[link] = centerContent.html().toString();
          }
        );
      });
    }
    return imageLinkList;
  // })
}
