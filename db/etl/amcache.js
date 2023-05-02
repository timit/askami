const { Client } = require("pg");
const got = require("got");
const url = require('url');

const main = async () => {
    try {
        const client = new Client({
            host: process.env.AMCACHE_HOST,
            port: process.env.AMCACHE_PORT,
            database: process.env.AMCACHE_DB,
            user: process.env.AMCACHE_USR,
            password: process.env.AMCACHE_PSW,
        });
        await client.connect();
        const res0 = await client.query(`SELECT count(*) FROM distributions`);
        console.log(`TOTAL OBSERVATIONS ${res0.rows[0].count}`);
        let next = '/rest/2/addons?offset=0' + '&limit=50&includeHidden=all&includePrivate=true';
        while (!(typeof next === 'undefined' || next === null)) {
            const res = await got(`https://marketplace.atlassian.com${next}`);
            const body = JSON.parse(res.body);
            const params = url.parse(res.requestUrl, true).query;
            const rangeBeg = parseInt(params.offset);
            const rangeEnd = rangeBeg + body._embedded.addons.length;
            console.log(`processing addons ${rangeBeg} - ${rangeEnd} of ${body.count}`);
            for (let i of body._embedded.addons) {
//                console.log(`i ${JSON.stringify(i,null,2)}`);
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
                console.log(`${i.status} ${i.key}`);
                try {
                    const res2 = await client.query(`INSERT INTO distributions (key, bundled_server, bundled_cloud, total_downloads, total_installs, total_users) VALUES ('${i.key}', ${i._embedded.distribution.bundled}, ${i._embedded.distribution.bundledCloud}, ${i._embedded.distribution.downloads}, ${i._embedded.distribution.totalInstalls}, ${i._embedded.distribution.totalUsers}) RETURNING id, observation_date`);
                    console.log(`${res2.command}ed - ${res2.rows[0].id} [${res2.rows[0].observation_date}]`);
                } catch (error) {
                    console.log(`FAILURE: ${error}`);
                }
            };
            if (typeof body._links.next === 'undefined' || body._links.next === null) {
                next = null;
            } else {
                next = body._links.next[0].href + '&limit=50&includeHidden=all&includePrivate=true';
            }
        }

        const res3 = await client.query(`SELECT count(*) FROM distributions`);
        console.log(`TOTAL OBSERVATIONS ${res3.rows[0].count}`);

        await client.end();
    } catch (error) {
        console.error(error);
    }
}
 
main();
