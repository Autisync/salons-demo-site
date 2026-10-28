# Salon demo websites: salon, barber, nails and tattoo

One demo repository with **four switchable websites** for four made-up beauty
businesses, so a prospect can click between them and see how their own site
could look. Everything on all four books and enquires into the CRM demo
account **Maré Hair & Beauty (Demo)** (Manchester), key `salon` in
`seedDemoBusinessMore.ts`.

| Page | Business (fictional) | Look | Signature animation |
| --- | --- | --- | --- |
| `/` | Pick a style | Dark canvas, four live preview panels | Rotating style name, mini previews |
| `/salon` | Maré Hair & Beauty (the CRM profile's real data) | Soft, editorial: teal, ink, sand; Bodoni Moda + Jost | Hair flowing in a hairdryer's airflow; scissors that snip a clean line as you scroll (pinned) |
| `/barber` | Cotton & Steel Barber Co. | Bold vintage: soot, bone, pole red, navy, brass; Anton + Archivo | Clippers buzzing across the side of a head leaving a skin fade; spinning pole; razor shine; scroll-driven before/after fade (pinned) |
| `/nails` | Gloss Club Nail Studio | Playful luxury: cream, blush, hot pink, plum; DM Serif Display + Outfit | A hand whose nails are painted one by one in brush strokes, colours cycling, palette picker recolours it, glitter; one nail built layer by layer as you scroll (pinned) |
| `/tattoo` | Hollow Moon Tattoo | Dark and inky: ink, bone, blood red, gold; Pirata One + Space Grotesk/Mono | A tattoo machine drawing line art onto skin on load and as you scroll (stencil, ink, healing; pinned); ink-splatter reveals; a flash sheet that draws itself |

The barber, nails and tattoo businesses, their teams, prices and reviews are
invented for the demo; their address, phone and hours are the demo account's
(22 Oldham Street, Manchester M1 1JN, 07700 900600, Mon–Fri 9–7, Sat 9–5),
and each page says so. The salon page uses the CRM profile's services,
prices, team, hours and reviews.

- **Booking** on every page is the on-page widget (`booking.js`) booking
  straight into the `mare-demo` calendar. It lists the CRM's services (hair
  and beauty). On barber, nails and tattoo the page's own price list is
  content, and a one-line note explains that all four styles book into one
  demo diary. If the CRM can't be reached (a preview), the widget says so
  kindly and links to the CRM's own booking page.
- **Enquiry forms** post to the website form of site `mare-demo`, as a lead,
  with the style in the message (`[Barber (Cotton & Steel Barber Co.) demo] …`)
  and in a `style` field.
- **Languages**: English (UK, £) in the HTML; European Portuguese (€, GBP
  ×1.15 rounded) in `i18n.js` (shared) and `<page>.pt.js`. `?lang=pt` works,
  the EN/PT switch is remembered on the device, and the style switcher keeps
  the language.
- **Style switcher**: a floating pill at the bottom of every page, with a
  curtain transition in the next business's colour.
- **Motion**: vanilla JS and CSS only, no libraries. `prefers-reduced-motion`
  shows everything finished and still. Content is readable without JS.
- **Photos** are hot-linked from the Pexels CDN; every one is listed with its
  subject in `src/photos.js` and sits on a gradient in case it doesn't load.

No framework and no install. `build.mjs` copies `src/` to `dist/`, writes the
photo URLs into the pages, injects the shared demo bar and switcher, and
writes `dist/config.js`.

## Files

- `src/index.html`, `home.css`, `home.js`, `home.pt.js`: the landing page.
- `src/<salon|barber|nails|tattoo>.html|.css|.js|.pt.js`: each style.
- `src/core.css`, `src/core.js`: shared chrome (demo bar, switcher, page
  transition, reveals, counters, parallax, forms, FAQ, booking mount).
- `src/i18n.js`: the language engine and the words every page shares.
- `src/booking.js`, `src/booking.css`: the booking widget (from the other
  demo sites; restyled per page with CSS variables).
- `src/photos.js`: every photo, by Pexels id and subject.

## Vercel

Import this repository, framework preset **Other**. Nothing else is needed:
the build settings are in `vercel.json` (`node build.mjs`, output `dist`,
clean URLs so `/salon` serves `salon.html`). Optional environment variables:

- `TRACK_KEY`: the website's visitor key from the CRM (Visitors > Tracking).
  Empty by default, so visits aren't counted until it's set.
- `CRM_API_URL` (default `https://api.autisync.com/api`), `CRM_APP_URL`
  (default `https://app.autisync.com`).
- `BOOKING_SLUG` and `SITE_SLUG` (both default `mare-demo`).

## Before a demo

On the server: `docker compose exec crm-backend npm run demo:business -- salon --refresh`
so the diary holds this week's appointments. Cancel test bookings in the CRM
afterwards. Every name, review and number is invented; phone numbers are in
Ofcom's drama range and emails use `.example`.

## Locally

```
CRM_API_URL=http://localhost:3001/api node build.mjs && npx serve dist
```
