import { createCheerioRouter } from '@crawlee/cheerio';

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_REGEX = /(?:\+44\s?|0)(?:\d[\s().-]?){9,12}\d/g;
const SOCIAL_HOSTS = ['facebook.com', 'instagram.com', 'linkedin.com', 'x.com', 'twitter.com', 'tiktok.com'];

const clean = (value) => value?.replace(/\s+/g, ' ').trim() ?? '';
const unique = (values) => [...new Set(values.map(clean).filter(Boolean))];

const classifyLead = ({ emails, phones, contactUrls, socialUrls, title, description }) => {
    let score = 0;
    if (emails.length) score += 30;
    if (phones.length) score += 20;
    if (contactUrls.length) score += 15;
    if (socialUrls.length) score += 10;
    if (/website|web design|marketing|seo|advertis/i.test(`${title} ${description}`)) score -= 10;
    if (!emails.length && !contactUrls.length) score -= 15;

    if (score >= 55) return 'hot';
    if (score >= 30) return 'warm';
    return 'research';
};

const getAbsoluteUrl = (href, baseUrl) => {
    try {
        return new URL(href, baseUrl).href;
    } catch {
        return null;
    }
};

export const router = ({ followLinks, maxFollowLinksPerPage }) => {
    const crawlerRouter = createCheerioRouter();

    crawlerRouter.addDefaultHandler(async ({ enqueueLinks, request, $, log, pushData }) => {
        const loadedUrl = request.loadedUrl ?? request.url;
        const loadedHost = new URL(loadedUrl).hostname;
        const title = clean($('title').first().text());
        const h1 = clean($('h1').first().text());
        const description = clean($('meta[name="description"]').attr('content'));
        const pageText = $('body').text();
        const emails = unique(pageText.match(EMAIL_REGEX) ?? []);
        const phones = unique(pageText.match(PHONE_REGEX) ?? []);

        const links = $('a')
            .toArray()
            .map((link) => ({
                text: clean($(link).text()),
                url: getAbsoluteUrl($(link).attr('href'), loadedUrl),
            }))
            .filter((link) => link.url);

        const contactUrls = unique(
            links
                .filter((link) =>
                    /contact|enquiry|booking|appointment|quote|get in touch/i.test(`${link.text} ${link.url}`),
                )
                .map((link) => link.url),
        );

        const socialUrls = unique(
            links.filter((link) => SOCIAL_HOSTS.some((host) => link.url.includes(host))).map((link) => link.url),
        );
        const websiteCandidates = unique(
            links
                .filter((link) => /website|visit site|homepage|official site/i.test(link.text))
                .map((link) => link.url)
                .filter((url) => !url.includes(loadedHost)),
        );

        const leadStatus = classifyLead({ emails, phones, contactUrls, socialUrls, title, description });

        await pushData({
            sourceUrl: loadedUrl,
            businessName: h1 || title,
            pageTitle: title,
            description,
            emails,
            phones,
            contactUrls,
            socialUrls,
            websiteCandidates,
            leadStatus,
            scrapedAt: new Date().toISOString(),
        });

        log.info(`Saved ${leadStatus} lead signals`, { url: loadedUrl, title });

        if (followLinks) {
            const urls = unique(
                links
                    .filter((link) =>
                        /contact|about|services|profile|business|company/i.test(`${link.text} ${link.url}`),
                    )
                    .map((link) => link.url),
            ).slice(0, maxFollowLinksPerPage);

            await enqueueLinks({ urls });
        }
    });

    return crawlerRouter;
};
