# Irish Language Decline Map

An interactive visualization showing the long-term decline in the percentage of people who can speak Irish across Irish counties. The app animates from the mid-19th century to today and highlights how Irish language ability changed over time.


## Live Demo

- GitHub Pages: https://danielcregg.github.io/irish-decline-map


## What’s in this repo

- `index.html` – Main web page for the visualization
- `styles.css` – Styling for the app
- `map.js` – Loads CSV data, renders the chart, and adds the animated timeline slider
- `historical_irish_data.csv` – Historical percentages by county and year (1841 → 2022)
- `processed_cso_data.csv` – CSO-derived 2011–2022 data used for recent years
- `process_data.py` – Script used to process CSO CSVs into the simplified `processed_cso_data.csv`
- `process_nisra_data.py` / `nisra_*.csv` – Initial Northern Ireland data exploration (not yet wired into the UI)


## Features

- Animated timeline from 1841 to 2022 with Play/Pause
- Year dropdown and slider to jump to a specific census year
- Color-coded bars by percentage to make change obvious at a glance
- Responsive UI that works on desktop and mobile
- Hover tooltips with county name, year, and exact percentage


## Quick start (local)

You can serve the site locally with any static web server. For example, with Python installed:

```bash
# From the repo root
python -m http.server 8080
```

Then open http://localhost:8080 in your browser.

If you run into CORS/loading issues, ensure you are using a local server (not opening the HTML file directly in the browser).


## Deploying to GitHub Pages

1. Commit and push changes to the `main` branch
2. In the GitHub repo, go to Settings → Pages
3. Under “Source”, pick “Deploy from a branch”
4. Select branch `main` and the root folder `/`
5. Save and wait 1–5 minutes for the site to go live at:
	 https://danielcregg.github.io/irish-decline-map


## Data sources and caveats

- Recent data (2011, 2016, 2022) is derived from CSO County-level counts of people who can speak Irish. See:
	- `cso_by_county.csv` (raw) → processed by `process_data.py` → `processed_cso_data.csv` (tidy)
- Historical data (1841–1991) in `historical_irish_data.csv` contains reasonable, illustrative estimates to convey the large-scale historical trend of decline. These figures should be treated as heuristic/educational, not official statistics. Where possible, you can replace or refine them with sourced figures from historical census publications.
- Northern Ireland (NISRA) data is present (`nisra_2011.csv`, `nisra_2021.csv`) but not yet visualized alongside ROI counties. This is a future enhancement.

If you have better-sourced historical series, you can drop a replacement CSV with the same columns:

```
Year,County,PercentageIrishSpeakers
1841,Galway County,96.2
...
```

…and the visualization will pick it up automatically.


## Updating or extending the data

- To regenerate recent CSO data (2011–2022):
	1. Update `cso_by_county.csv` with latest county totals and Irish speaker counts
	2. Run `process_data.py` to create `processed_cso_data.csv`
	3. Optionally merge or splice those values into `historical_irish_data.csv`

- To include Northern Ireland:
	- Add NI counties and percentages into `historical_irish_data.csv` using the same column names; then extend the chart logic to include them (and, in a future version, show an all-island choropleth with GeoJSON boundaries).


## Troubleshooting

- “Loading historical map data…” keeps spinning
	- Ensure `historical_irish_data.csv` is present in the repo root (same folder as `index.html`)
	- Make sure you’re viewing through a local server (e.g., `python -m http.server`), not opening the file directly
	- Open the browser console (F12) and check for errors; the app logs helpful messages

- Slider doesn’t appear
	- The bar chart loads first; animation controls are added right after. If an animation error occurs, the basic chart still works. Check console logs.

- Nothing shows on GitHub Pages
	- Verify Pages is enabled (Settings → Pages)
	- Branch is set to `main` and folder is `/`
	- Try a hard refresh (Ctrl/Cmd + Shift + R)

- Plotly warning about “plotly-latest.min.js”
	- We now use a pinned modern version: `https://cdn.plot.ly/plotly-2.35.2.min.js`


## Roadmap

- Switch to a proper all-island choropleth using county-level GeoJSON
- Integrate Northern Ireland (NISRA) data in the same timeline
- Add confidence/metadata for historical figures and link to sources
- Add per-capita/absolute counts toggles and small multiples
- Add accessibility improvements and keyboard timeline control


## Contributing

PRs are welcome! If you plan large changes (e.g., new map types or data sourcing), consider opening an issue first to discuss approach and data format.


## License

MIT — see `LICENSE` (to be added). Data sources may be subject to their own licensing terms; check CSO/NISRA usage guidance.