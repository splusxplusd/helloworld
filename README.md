# Company website

Static site for doneanddone.co. Plain HTML, CSS and JavaScript, no build step.

```
site/
  index.html            home page
  blog/*.html           blog posts (two starter posts, to be rewritten)
  assets/site.css       all styles
  assets/site.js        header, About menu, hero tiles, isometric scenes, order flow
  assets/flags.js       feature flags
```

Preview locally by opening `index.html` in a browser, or run `python3 -m http.server` in this folder.

## Feature flags

`assets/flags.js` holds the flags. Today there is one:

- `factory` (off): the scroll-driven isometric factory. While it's off, the simpler animated order flow shows instead.
  Preview it without changing the flag by adding `?factory=on` to the URL or opening the page with `#factory-on`.

## Open items before going live

- Hosting: GitHub Pages from main (CNAME file sets the domain)
- A working `hello@doneanddone.co` mailbox
- Final logo (the mark is an SVG redraw of the concept)
- Replace the starter blog posts

See [DESIGN.md](DESIGN.md) for the logo, colours, type, components, motion and speed budget.
