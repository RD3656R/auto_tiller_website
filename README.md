# Auto Tiller website

A sailing-inspired website for the Auto Tiller steering-assistance prototype.

**Live website:** https://rd3656r.github.io/auto_tiller_website/

## Explore

- Ryan’s sailing story, original sail icon, real app screenshots, and hardware photos.
- Interactive heading illustration with disturbance controls and a tuning comparison.
- A live simulated error chart and a 350° → 010° heading-wrap example.
- An interactive explanation of the phone → controller → actuator signal path.
- Expandable engineering notes, a testing plan, and frequently asked questions.
- The project film and contact information: ryandeng24@gmail.com.

The browser simulation is an illustration. It is not connected to a boat, does not use actual test data, and does not demonstrate validated on-water performance. Auto Tiller remains an experimental prototype.

## Edit

This is a buildless static website. No package installation or build step is needed.

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, copy, and links |
| `styles.css` | Main visual style and responsive layout |
| `app.js` | Heading illustration, tuning comparison, and main interactions |
| `enhancements.css` / `enhancements.js` | Engineering notebook, signal path, contact interaction, reading progress |
| `assets/` | Original project photos, icon, app screenshot, film, captions, and fonts |

Run `python3 serve.py` for a local preview, or double-click `Start-Website.command` on macOS. Keep its terminal window open while browsing. Stop with Control-C.

## Publishing

GitHub Pages serves the **root of the main branch**. `.nojekyll` keeps the site as plain static files. Push changes to `main` to publish an update.

## Related repositories

- [Flutter app](https://github.com/AutoTiller/auto_tiller)
- [ESP32 firmware](https://github.com/AutoTiller/tillerv1)

Bundled DM Sans and Manrope fonts retain their SIL Open Font License notices in `assets/fonts/`. Website assets and project material remain subject to their respective rights; this repository does not grant a blanket license for those materials.
