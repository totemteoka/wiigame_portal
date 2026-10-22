# WiiG Portal v48 — HelloBoss 7 games with supplied artwork

- Updated all seven game image sources to the exact image URLs supplied by the user.
- Game artwork is responsive (`object-fit: cover`) in home cards, catalog, detail page, and My Games.
- Happy Fishing opens in a new tab because its server blocks cross-origin iframe embedding with `X-Frame-Options: SAMEORIGIN`.
- Other games retain the iframe overlay and the open-in-new-tab fallback.

Open `index.html` through a local static server or deploy the folder to GitHub Pages.
