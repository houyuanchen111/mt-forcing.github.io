# MT Forcing

Project website for **MT Forcing: Towards Stable and Consistent Multi-Turn Image Editing with Autoregressive Diffusion**.

An English, static research website with a 15-turn comparison video, real eight-turn editing examples, interactive model comparisons, a method overview, per-turn benchmark charts, and the research manuscript.

## Preview

Open `index.html` directly in a browser, or serve this directory locally:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Visit <http://127.0.0.1:8765/>. No build step, package installation, or external CDN is required. Website images, styles, scripts, data, and the manuscript are included.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and research content |
| `styles.css` | Visual design and responsive layouts |
| `app.js` | Video playback behavior, comparisons, charts, and dialogs |
| `data.js` | Case descriptions, editing instructions, benchmark data, and citation |
| `links.js` | arXiv, GitHub, and Hugging Face destinations |
| `assets/cases/` | Full-size WebP examples and thumbnails |
| `videos/` | 12-second kitten comparison video and final-turn poster |
| `assets/mt-forcing-paper.pdf` | Current research manuscript |
| `.nojekyll` | Serve the static site without Jekyll processing |

## Release links

The three resource buttons appear in the hero. They currently show **Coming soon**. Add the official HTTPS project URLs at the top of `links.js` when each resource is published:

```js
window.MT_LINKS = {
  arxiv: '',
  github: '',
  huggingface: ''
};
```

Configured entries automatically become external links. Empty entries retain the release-information dialog.

## Content maintenance

Editing sequences, per-turn chart values, and citation metadata are embedded in `data.js`. Update that bundle when the research content changes. Replace the manuscript PDF when the paper is updated.

The evaluation uses 100 eight-turn sessions. The website documents failure-triggered IF/CC scoring and the scope of the evaluation. The PDF is the current research manuscript.

This directory contains only the static website and repository metadata. Raw experiment exports, preparation scripts, verification records, unused images, and ZIP archives are kept separately. They are not required to serve the website. The root-level Git allowlist prevents these local working files from being accidentally added again.

## Push to GitHub

This directory is an independent Git repository on the `main` branch. Review and commit the current website before pushing:

```sh
git add -A
git commit -m "Update MT Forcing project website"
```

After creating an empty repository on GitHub, run these commands from this directory, replacing the placeholders with your repository name:

```sh
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Use the repository root as the GitHub Pages publishing directory. All website asset URLs are relative, so the site supports both a user-site domain and a project-site subdirectory. No build command or dependency installation is required.

The website can also be served by any static host using this directory as its document root.
