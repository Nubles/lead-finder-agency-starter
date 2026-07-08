import { CheerioCrawler } from '@crawlee/cheerio';
import { Actor } from 'apify';

import { router } from './routes.js';

await Actor.init();

const {
    startUrls = [{ url: 'https://www.yell.com/ucs/UcsSearchAction.do?keywords=dentist&location=Manchester' }],
    maxRequestsPerCrawl = 50,
    followLinks = true,
    maxFollowLinksPerPage = 8,
    useProxy = false,
    targetCountry = 'Global',
    enableCharging = false,
} = (await Actor.getInput()) ?? {};

const proxyConfiguration = useProxy ? await Actor.createProxyConfiguration() : undefined;

const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl,
    requestHandler: router({ followLinks, maxFollowLinksPerPage, targetCountry, enableCharging }),
});

await crawler.run(startUrls);

await Actor.exit();
