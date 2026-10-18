# MT Forcing

Project website for **MT Forcing: Towards Stable and Consistent Multi-Turn Image Editing with Autoregressive Diffusion**.

An English, static research website with real eight-turn editing examples, interactive model comparisons, a method overview, per-turn benchmark charts, and the research manuscript.

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
| `app.js` | Editing replay, comparisons, charts, and dialogs |
| `data.js` | Case descriptions, editing instructions, benchmark data, and citation |
| `links.js` | arXiv, GitHub, and Hugging Face destinations |
| `assets/cases/` | Full-size WebP examples and thumbnails |
| `assets/benchmark.json` / `.csv` | Per-turn evaluation data |
| `assets/citation.bib` | BibTeX citation |
| `assets/mt-forcing-paper.pdf` | Current research manuscript |

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

Keep the chart data in `data.js`, `assets/benchmark.json`, and `assets/benchmark.csv` consistent. Keep the citation in `data.js` aligned with `assets/citation.bib`. Replace the manuscript PDF when the paper is updated.

The evaluation uses 100 eight-turn sessions. The website documents failure-triggered IF/CC scoring and the inference-setting differences in the qualitative examples. The PDF is the current research manuscript.

The local reference checkout (`rea`), research notes (`research/`), research-specific preparation scripts (`scripts/`), and generated ZIP archive are intentionally excluded from Git. They are not required to run the website. In the original workspace, detailed preparation and verification instructions remain in `research/local-workflow.md`.

## Push to GitHub

This directory is an independent Git repository on the `main` branch. After creating an empty repository on GitHub, run these commands from this directory, replacing the placeholders with your repository name:

```sh
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

The website can also be served by any static host using this directory as its document root.
