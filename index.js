const axios = require('axios')
const cheerio = require('cheerio')
var http = require('http')
var pg = require('pg');
var conString = "postgres://scraper:scraperpwd@scraper-database.cwj5epzblghb.us-east-1.rds.amazonaws.com:5432/scraperdb";

var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].theTime);
    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
    client.end();
  });
});

// const url = 'https://news.ycombinator.com/newest'
// axios.get(url).
//     then(response => {
//         console.log(getData(response.data));
//     })
//     .catch(error => {
//         console.log(error);
//     })

// let getData = html => {
//     data = [];
//     const $ = cheerio.load(html);
//     $('table.itemlist tr td:nth-child(3)').each((i, elem) => {
//         data.push({
//         title : $(elem).text(),
//         link : $(elem).find('a.storylink').attr('href')
//         });
//     });
//     console.log(data);
// }

// http.createServer(function (req, res) {
//     res.write('Hello World!'); //write a response to the client
//     res.end(); //end the response
//   }).listen(8080); 



