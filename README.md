# Washakie AI

A $10,000 proposal for a grass-roots AI pilot program in Washakie County, Wyoming: twelve working
websites for local subjects, four public workshops, and a method published free. It is
written in the format it proposes to teach.

Live: **https://washakie-ai.online**

## What is on the page

One page, three depths:

| column | what it holds |
|---|---|
| **A · Plain answers** | What is being asked for, why the county needs it, what the money buys, who does the work, and the catch. |
| **B · Sources** | *Internal links*: the most recent content change. *External links*: every reference to some other website, each on a card that says what the source is, who made it, what you would find there and why it is cited, with the link last. |
| **C · How it works** | The budget, who applies, the calendar, how anyone would know it worked, and the risks. |

On a phone the columns become three buttons; printed, they become one document.

## The grant

The Wyoming Business Council's Community Economic Growth Grant, under Rural Development
Grants: a maximum award of $10,000, with deadlines on 1 March and 1 September. The program
funds communities and organizations rather than individuals, so a local sponsor has to be
the applicant.

## The files

| file | what it is |
|---|---|
| `index.html` | the proposal: columns A, B and C, styles and script inside |
| `masthead-map.svg` | the map at the top of the page |
| `social.png` | the preview card shown when the link is shared |
| `links.json` | the date of the last check of the source links, and any that were found dead; the page marks dead links from it |
| `setup.html`, `domain.html` | working pages carried over from the Three Columns template; not linked from the page and not indexed |
| `favicon.svg`, `apple-touch-icon.png`, `robots.txt`, `sitemap.xml`, `404.html`, `CNAME` | the usual furniture |

## Publishing

Edit `index.html`, commit, and push to `main`. GitHub Pages rebuilds the site in about a
minute. There is no build step, no database and no server.

## Built with

[Three Columns](https://threecolumns.online), the format this page uses. The finished local
example cited in the proposal is [worland-dog-law.online](https://worland-dog-law.online).

## License

MIT. See `LICENSE`.

Walter Wilkinson · Worland · Washakie County · Wyoming
