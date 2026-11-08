# Done & Done design system

Status: **v0, 8 Nov 2026.** This records what the website uses today, the direction we are heading in, and what is still undecided. The code is the source of truth for exact values (`assets/site.css`). Update this file when either changes.

## North star

**Fast, clean and calm, in the spirit of Stripe.** Concretely:

- **Speed is part of the design.** Pages should feel instant on a phone on LTE. When an effect costs speed, the effect goes.
- **Restraint.** Lots of white space, one accent colour (blue), and colour that carries meaning: green means done, red means a problem.
- **Typography does most of the work.** Big, confident headings, short paragraphs and plain words.
- **Motion has a job.** It explains something (an order moving through the business, a problem turning into a fix) or adds a small moment of delight. It never blocks reading. It always respects `prefers-reduced-motion`.
- **One system.** The website and, later, the product share the same tokens, so the brand feels the same from the first visit to daily use.

Taking inspiration from Stripe means copying its qualities: precision, generous spacing, crisp type, subtle depth and careful motion. It does not mean copying its layouts, gradients or illustrations.

## Logo

| | |
|---|---|
| Mark | Rounded "D" made of two nested strokes, an outer D and an inner D, drawn in a blue gradient. File: [`brand/mark.svg`](brand/mark.svg). White version for dark or blue backgrounds: [`brand/mark-white.svg`](brand/mark-white.svg). |
| Gradient | `#2E8BFF` → `#0F55D6`, top-left to bottom-right |
| Wordmark | "Done & Done" in Bricolage Grotesque, weight 800, letter-spacing −0.02em, set beside the mark with a gap of 0.6× the wordmark size |
| Favicon | `favicon.svg` (thicker strokes for small sizes), `favicon.ico` (16/32/48), `apple-touch-icon.png` (180, on white), `icon-512.png`. |
| Minimum size | Mark 24 px; below that use the favicon artwork. |
| Motion | In the header, the inner D turns and the outer D "breathes" on a 7-second loop, and speeds up on hover. The logo is never animated in print, in email or in favicons. |

**Still open:**
- Final logo. The current mark is an SVG redraw of D's concept, and a designer pass is likely.
- Spelling: the site uses **"Done & Done"** and the pitch deck uses "Done&Done". We should pick one and use it everywhere.
- Social share image (Open Graph) and a lock-up file with the mark and wordmark together.

## Colour

All colours are CSS custom properties on `:root` in `assets/site.css`. The site is **light only** (decided 8 Nov), with no dark theme.

| Role | Token | Value |
|---|---|---|
| Page background | `--bg` | `#FFFFFF` |
| Soft surface | `--surface-2` | `#F1F5FC` |
| Tint | `--tint` | `#EAF1FE` |
| Ink (text) | `--ink` | `#0C1A30` |
| Muted text | `--muted` | `#4A5872` |
| Lines | `--line` | `#D9E1EE` |
| **Brand blue** | `--blue` | `#1764E8` |
| Blue, pressed | `--blue-strong` | `#0F4FC2` |
| Hero top | `--hero-top` | `#A9C7FF` |
| Blue band | `--band` | `#2F6FEA` |
| Dark card | `--dark` | `#0E1B33` (text `#EEF3FC`, muted `#A9B8D3`) |
| Done (green) | `--done` | `#1E9E6A` (on dark: `#3CD08A`) |
| Problem (red) | n/a | `#E5484D` (on dark: `#FF6B6F`) |

Rules:
- Blue is the only accent. Green and red are used only for done and problem states.
- Body text is `--ink` or `--muted` on white. Don't put grey text on a tinted background.
- Aim for WCAG AA contrast at minimum. Check any new pairing before using it.

## Typography

| Use | Family | Weights |
|---|---|---|
| Headings, wordmark | Bricolage Grotesque | 500–800 |
| Body, UI | DM Sans | 400–700 |
| Numbers, code | DM Mono | 400–500 |

- Headings: line-height 1.06, letter-spacing −0.02em, `text-wrap: balance`.
- Body: 1rem with line-height 1.6.
- Sizes today: `--step-4` = clamp(2.6rem, 6.4vw, 4.8rem) for page titles, and `--step-3` = clamp(2rem, 4vw, 2.9rem) for section titles. Smaller sizes are set ad hoc (see the gaps below).
- Use tabular figures (`font-variant-numeric: tabular-nums`) wherever numbers line up.

## Shape, depth and spacing

- **Radius:** pills and buttons are 999px. Cards are 18–28px today, and the scale needs tidying (see the gaps below).
- **Shadow:** one soft shadow, `--shadow: 0 24px 60px -32px rgba(11,35,80,.35)`. Use it for floating things such as the header pill, menus and hero cards. Other cards use a 1px `--line` border instead of a shadow.
- **Layout:** content is at most 74rem wide (`--wrap`), with a 16px minimum side gutter that respects safe areas on phones.
- **Glass:** the header becomes a frosted pill on scroll, using `--glass` `rgba(255,255,255,.72)` with a backdrop blur.

## Components on the site today

| Component | Notes |
|---|---|
| Header | Full width at the top, then a floating glass pill after 40px of scroll. On mobile the links stay and "Join the pilot" hides. |
| About menu | Slides down on hover or click. A click right after a hover keeps it open. |
| Buttons | A blue pill for the primary action and an outline pill for secondary actions. Only one primary action per view. |
| Hero tiles | Pixel tiles that toggle on hover and flip on their own. They are kept clear of the nav row. |
| Problem / fix card | A dark card with two auto-cycling tabs and a progress bar. Marks use **tiny-tells Flipdot** dots (red for problem, green for done), which flip through a "working" state when the tab changes. |
| App cards | A white card with a 1px border, which lifts on hover. |
| Isometric scenes | SVG drawn in code (`Scene` helper in `site.js`), using the `--iso-*` tokens. The factory scene is behind the `factory` flag. |
| Blue band | A full-bleed `--band` section framed by pixel edges ("Built for Canada"). |
| FAQ | Native `<details>` elements. |
| Maple leaves | GSAP MotionPath leaves around "Set up for Canada." They stay still when reduced motion is on. |

## Motion

- Ease in and out with `cubic-bezier(.6,.05,.3,1)` for moves and `cubic-bezier(.3,.7,.3,1)` for entrances. Most transitions are 0.2–0.8s.
- Animate only `transform` and `opacity` (plus SVG stroke offsets). Never animate layout.
- With `prefers-reduced-motion: reduce`, every loop stops and everything shows in its final state.
- Feature flags (`assets/flags.js`) gate heavy pieces. `factory: false` for now; preview it with `?factory=on`.

## Speed budget

Measure with Lighthouse in mobile mode, and treat these as targets every change must keep.

| Metric | Target |
|---|---|
| Largest Contentful Paint | < 1.5 s |
| Cumulative Layout Shift | < 0.05 |
| Interaction to Next Paint | < 100 ms |
| Total transfer, first load (gzip) | < 200 KB |
| Our own HTML + CSS + JS (gzip) | < 50 KB (today about 26 KB) |

Today the page loads three things from third parties: Google Fonts, GSAP plus MotionPath (cdnjs, about 35 KB gzip) and tiny-tells (jsdelivr). To get faster:

1. **Self-host and subset the fonts** (WOFF2, latin only, `font-display: swap`) and preload the heading font. This is the biggest win, and it also removes a third-party request.
2. **Vendor GSAP and tiny-tells** into `assets/vendor/` with pinned versions, so the site doesn't depend on CDNs.
3. Load GSAP only when the hero leaves are on screen, or replace it with CSS `offset-path` (supported in all current browsers).
4. Inline the critical CSS for the first screen, and add `width` and `height` to every image.

## Gaps to close next

1. A **type scale** with named steps from small to display, instead of ad hoc sizes.
2. A **spacing scale** (4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96).
3. A **radius scale**: small 8, medium 14, large 20, extra-large 28, and pill.
4. **Elevation tokens**: flat (border), raised (header and menus), overlay (dialogs).
5. A **component inventory page** (`/design`) that shows every token and component live, Stripe-docs style.
6. **Product UI:** carry these tokens into the Odoo backend theme (colours, fonts, radius) so the app matches the site.
7. Final logo, social image, and a decision on the spelling.

## Credits and licences

- Fonts: Bricolage Grotesque, DM Sans and DM Mono (SIL Open Font License).
- GSAP 3.12.5 and MotionPathPlugin (GreenSock standard licence, no charge).
- tiny-tells 0.5.0 by talbs (MIT).
