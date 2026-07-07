import { createCheerioRouter } from '@crawlee/cheerio';

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const SOCIAL_HOSTS = ['facebook.com', 'instagram.com', 'linkedin.com', 'x.com', 'twitter.com', 'tiktok.com'];

const PHONE_PATTERNS = {
    US: /(?:\+1\s?|1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    CA: /(?:\+1\s?|1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    UK: /(?:\+44\s?|0)(?:\d[\s().-]?){9,12}\d/g,
    AU: /(?:\+?61\s?|0)[23478](?:[\s.-]?\d){8}/g,
    Global: /(?:\+1\s?|1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|(?:\+44\s?|0)(?:\d[\s().-]?){9,12}\d|(?:\+?61\s?|0)[23478](?:[\s.-]?\d){8}/g
};

const INVALID_EMAIL_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.css', '.js', '.woff', '.woff2', '.ttf', '.otf', '.ico', '.pdf', '.mp4', '.mp3'];

const clean = (value) => value?.replace(/\s+/g, ' ').trim() ?? '';
const unique = (values) => [...new Set(values.map(clean).filter(Boolean))];

const filterEmails = (emailsList) => {
    return unique(
        emailsList
            .map((email) => email.toLowerCase())
            .filter((email) => {
                const hasAssetExtension = INVALID_EMAIL_EXTENSIONS.some((ext) => email.endsWith(ext));
                const isWellFormed = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
                return isWellFormed && !hasAssetExtension;
            })
    );
};

const getPhones = (text, country) => {
    const pattern = PHONE_PATTERNS[country] || PHONE_PATTERNS.Global;
    const matches = text.match(pattern) ?? [];
    return unique(matches);
};

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

export const router = ({ followLinks, maxFollowLinksPerPage, targetCountry }) => {
    const crawlerRouter = createCheerioRouter();

    crawlerRouter.addDefaultHandler(async ({ enqueueLinks, request, $, log, pushData }) => {
        const loadedUrl = request.loadedUrl ?? request.url;
        const loadedHost = new URL(loadedUrl).hostname;
        const title = clean($('title').first().text());
        const h1 = clean($('h1').first().text());
        const description = clean($('meta[name="description"]').attr('content'));
        const pageText = $('body').text();
        const emails = filterEmails(pageText.match(EMAIL_REGEX) ?? []);
        const phones = getPhones(pageText, targetCountry);

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
