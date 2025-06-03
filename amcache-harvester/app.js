const { Client } = require("pg");
const got = require("got");
const url = require('url');
const logger = require('./lib/logger.js');

const main = async () => {
    const context = '[ETL.main]';
    logger.debug(`${context}`);
    //disable default console logger
    console.log = function () { };
    try {
        const client = new Client({
            host: process.env.AMCACHE_HOST,
            port: process.env.AMCACHE_PORT,
            database: process.env.AMCACHE_DB,
            user: process.env.AMCACHE_USR,
            password: process.env.AMCACHE_PSW
        });
        await new Promise(resolve => setTimeout(resolve, 30000));
        await client.connect();
        const res0 = await client.query(`SELECT count(*) FROM distributions`);
        logger.info(`${context} TOTAL OBSERVATIONS BEFORE ${res0.rows[0].count}`);
        let next = '/rest/2/addons?offset=0' + '&limit=50&includeHidden=all&includePrivate=true';
        logger.debug(`${context} ${next}`);
        let expectedCount = 0;
        while (!(typeof next === 'undefined' || next === null)) {
            const res = await got(`https://marketplace.atlassian.com${next}`);
            const body = JSON.parse(res.body);
            expectedCount = body.count;
            const params = url.parse(res.requestUrl, true).query;
            const rangeBeg = parseInt(params.offset);
            const rangeEnd = rangeBeg + body._embedded.addons.length;
            logger.info(`${context} processing addons ${rangeBeg} - ${rangeEnd} of ${body.count}`);
            for (let i of body._embedded.addons) {
                logger.debug(`${context} i ${JSON.stringify(i,null,2)}`);
                if (typeof i._embedded.distribution.bundled === 'undefined' || i._embedded.distribution.bundled === null) {
                    i._embedded.distribution.bundled = false;
                }
                if (typeof i._embedded.distribution.bundledCloud === 'undefined' || i._embedded.distribution.bundledCloud === null) {
                    i._embedded.distribution.bundledCloud = false;
                }
                if (typeof i._embedded.distribution.downloads === 'undefined' || i._embedded.distribution.downloads === null) {
                    i._embedded.distribution.downloads = 0;
                }
                if (typeof i._embedded.distribution.totalInstalls === 'undefined' || i._embedded.distribution.totalInstalls === null) {
                    i._embedded.distribution.totalInstalls = 0;
                }
                if (typeof i._embedded.distribution.totalUsers === 'undefined' || i._embedded.distribution.totalUsers === null) {
                    i._embedded.distribution.totalUsers = 0;
                }
                logger.debug(`${context} ${i.status} ${i.key}`);
                try {
                    const res2 = await client.query(`INSERT INTO distributions (key, bundled_server, bundled_cloud, total_downloads, total_installs, total_users) VALUES ('${i.key}', ${i._embedded.distribution.bundled}, ${i._embedded.distribution.bundledCloud}, ${i._embedded.distribution.downloads}, ${i._embedded.distribution.totalInstalls}, ${i._embedded.distribution.totalUsers}) RETURNING id, observation_date`);
                    logger.debug(`${context} ${res2.command}ed - ${res2.rows[0].id} [${res2.rows[0].observation_date}]`);
                } catch (error) {
                    logger.warn(`${context} FAILURE: ${error}`);
                }
            };
            if (typeof body._links.next === 'undefined' || body._links.next === null) {
                next = null;
            } else {
                next = body._links.next[0].href + '&limit=50&includeHidden=all&includePrivate=true';
            }
            logger.debug(`${context} ${next}`);
        }
        const res3 = await client.query(`SELECT count(*) FROM distributions`);
        logger.info(`${context} TOTAL OBSERVATIONS AFTER ${res3.rows[0].count}`);
        let addedCount = res3.rows[0].count - res0.rows[0].count;
        if (addedCount!=expectedCount) {
            logger.warn(`${context} TOTAL OBSERVATIONS ADDED ${addedCount} != EXPECTED ${expectedCount}`);
        } else {
            logger.info(`${context} TOTAL OBSERVATIONS ADDED ${addedCount} == EXPECTED ${expectedCount}`);
        }
        await client.end();
    } catch (error) {
        if (error instanceof AggregateError) {
          logger.error(`${context} multiple errors occurred:`);
          error.errors.forEach(err => logger.error(`${context} ${err}`));
        } else {
            logger.error(`${context} ${error}`);
        }
    }
}
 
main();
