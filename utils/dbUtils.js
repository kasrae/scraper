const pg = require('pg');

let connect = async function(connectionString) {
    let postgres;
    postgres = new pg.Client(connectionString);

    try {
        await postgres.connect();
    } catch (error) {
        console.error("[PG] error " + error);
    }

    return postgres;
}

let query = async function(client, queryString) {
    let queryResponse;

    try {
        queryResponse = await client.query(queryString);
    } catch (error) {
        console.error("[PG] error " + error);
    }

    return queryResponse;
}

exports.connect = connect;
exports.query = query;
