const axios = require('axios');
const cheerio = require('cheerio');
const http = require('http');
const dbTools = require('./utils/dbUtils.js');
const kmsTools = require('./utils/kmsUtils.js');
const fs = require('fs');


function loadProperties() {
    return JSON.parse(fs.readFileSync('./config/properties.json', 'utf8'));
}

// Scrape first page of hacker news url and store link and url into hackernewsitem table
async function scrapeAndStore(url, dbClient) {
    let html, metadata;
    try {
        html = await axios.get(url);
        metadata = getHtmlData(html.data);
    } catch (e) {
        console.error(e);
        return {"Result": "Unsuccessful", "Error": e};
    }
    
    try {
        var item = 0;
        for (; item < metadata.length; item++) { 
            var title = escape(metadata[item].title);
            var link = escape(metadata[item].link);
            queryString = `INSERT INTO public.\"hackernewsitem\" (title, link) VALUES (\'${title}\', \'${link}\');`;
            await dbTools.query(dbClient, queryString);
        }
    } catch (e) {
        console.error('Unable to query postgres: ' + e);
        return {"Result": "Unsuccessful", "Error": e};
    }

    return {"Result": "Successful", "Item count": item};
}

// Get * from hackernewsitem table
async function getMetadata(dbClient) {
    try {
        queryString = 'SELECT * FROM public.\"hackernewsitem\";';
        var res = await dbTools.query(dbClient, queryString);
    } catch (e) {
        console.error('Unable to query postgres: ' + e);
        return {"Result": "Unsuccessful", "Error": e};
    }
    var row = 0;
    for (; row < res.rows.length; row++) {
        res.rows[row].title = unescape(res.rows[row].title);
        res.rows[row].link = unescape(res.rows[row].link);
    }
    return res.rows;
}

// Scrapes html from web page
function getHtmlData(html) {
    data = [];
    const $ = cheerio.load(html);
    $('table.itemlist tr td:nth-child(3)').each((i, elem) => {
        data.push({
        title : $(elem).text(),
        link : $(elem).find('a.storylink').attr('href')
        });
    });
    return data;
}

// server
var server = http.createServer(async function (req, res) {

    properties = loadProperties();
    let decryptedConnectStr, pgClient;

    console.log("[index.js] Decrypting connection string");
    try {
        decryptedConnectStr = await kmsTools.decrypt(properties.dbConnectionString);
    } catch (e) {
        console.error("[index.js] Unable to decrypt connection string. Error:" + e);
        throw e;
    }
    console.log("[index.js] Connection string decrypted");
    
    console.log("[index.js] Connecting to postgres client");
    try {
        pgClient = await dbTools.connect(decryptedConnectStr);
    } catch (e) {
        console.error("[index.js] Unable to connect to postgres. Error:" + e);
        throw e;
    }
    console.log("[index.js] Connected to postgres");


    if (req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        result = await getMetadata(pgClient);
        res.write(JSON.stringify(result));
        res.end();
    } else if (req.method === "POST") {
        res.writeHead(200, { "Content-Type": "application/json" });
        result = await scrapeAndStore(properties.Scrape_URL, pgClient);
        res.write(JSON.stringify(result));
        res.end();
    }
}).listen(8080);



