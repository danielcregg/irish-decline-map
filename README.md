# Irish Language Decline Map

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![Plotly](https://img.shields.io/badge/Plotly.js-3F4F75?style=flat-square&logo=plotly&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)

An interactive animated visualization showing the dramatic decline in Irish language speakers across Irish counties from 1841 to 2022.

**Live Demo:** [https://danielcregg.github.io/irish-decline-map](https://danielcregg.github.io/irish-decline-map)

## Overview

This project visualizes over 180 years of Irish language decline using an animated bar chart powered by Plotly.js. Users can play through the historical timeline, scrub to specific census years, and hover over counties for detailed statistics. Recent data is sourced from the Central Statistics Office (CSO) and historical estimates provide educational context for the long-term trend.

## Features

- **Animated Timeline** -- play/pause animation from 1841 to 2022 with smooth transitions
- **Interactive Slider** -- drag to jump to any census year instantly
- **Year Dropdown** -- select a specific year from a dropdown control
- **Color-Coded Bars** -- visual gradient from high to low Irish-speaking percentages
- **Hover Tooltips** -- county name, year, and exact percentage on hover
- **Responsive Design** -- works on desktop and mobile browsers
- **Data Processing Scripts** -- Python scripts to process raw CSO and NISRA census data

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- [Python 3](https://www.python.org/) (only needed for data processing scripts)

## Getting Started

### Installation

```bash
git clone https://github.com/danielcregg/irish-decline-map.git
cd irish-decline-map
```

### Usage

Serve the site locally with any static web server:

```bash
python -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

To reprocess CSO data:

```bash
python process_data.py
```

## Tech Stack

- **Visualization:** [Plotly.js 2.35](https://plotly.com/javascript/)
- **CSV Parsing:** [Papa Parse](https://www.papaparse.com/)
- **Languages:** JavaScript, HTML5, CSS3
- **Data Processing:** Python
- **Data Sources:** CSO Ireland, NISRA (Northern Ireland)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. Data sources may be subject to their own licensing terms; check CSO/NISRA usage guidance.
