# Sonification Methods, Tools and NASA Data for the "Earth Information Jukebox" Challenge

Research date: 2026-11-14. Scope: NASA sonification precedents, core techniques and pitfalls, build tools, sonification-friendly NASA/partner Earth datasets, and design/accessibility guidance. Every finding below has an inline source; claims I could not verify in this session are in "Gaps".

## 1. What NASA sonification projects exist, and how did they map data to sound?

### Takeaway
NASA's biggest sonification program is the Chandra-led "A Universe of Sound" (astronomy images). It maps image position to time and stereo, color/wavelength to pitch or instrument, and brightness to volume, and it publishes each layer separately so listeners can learn the mapping. On the Earth side, NASA's own work is smaller: a NASA Earthdata (IMPACT team) blog and open-source Streamlit app sonify Landsat/Sentinel-2 NDVI and the "warming stripes." Most well-known climate sonifications (global temperature, Arctic sea ice) are third-party works built on NASA GISS data, not official NASA products.

### Cited Findings
**Astronomy ("A Universe of Sound", Chandra X-ray Center + NASA's Universe of Learning)**
- NASA says the project has made "dozens" of sonifications. Each wavelength is assigned its own instrument or synthesized sound. In Cassiopeia A, modified piano = Chandra X-ray, strings/brass = Webb/Spitzer infrared, small cymbals = stars located with Hubble visible light. The separate layers are published "so listeners can see how the data was translated." Blind and low-vision (BLV) community members helped shape the product. (NASA article dated Dec 18, 2024; updated Jan 22, 2025.) — [NASA Science: Open Science Reveals Sounds of Space](https://science.nasa.gov/open-science/astronomy-data-sonification/)
- Main hub: [chandra.harvard.edu/sound](https://chandra.harvard.edu/sound/). Example multi-layer piece: [Cassiopeia A](https://chandra.si.edu/sound/casa_multi.html). Documentary: ["Listen to the Universe" on NASA+](https://plus.nasa.gov/video/listen-to-the-universe/) — [NASA Science](https://science.nasa.gov/open-science/astronomy-data-sonification/)
- Typical Chandra mappings: color → pitch (redder = lower, blue/violet = higher), as in Tycho, M87 and IC 443. Vertical position → pitch (higher in the image = higher pitch) while a left-to-right sweep sets time and stereo pan (Westerlund 2, M87). Brightness → volume. For the Vela pulsar, distance from the center → pitch. Instrument by data type: point sources are bells or plucked tones, diffuse emission is a sustained tone, and Hubble optical data is often strings or harp. — [Chandra 2021 sonification release](https://chandra.si.edu/photo/2021/sonify4/); [Chandra Vela page](https://chandra.cfa.harvard.edu/sound/vela.html); [Chandra 2024 sonification animations](https://chandra.harvard.edu/photo/2024/sonify8/animations.html)
- Pieces are made by Kimberly Arcand (CXC) with Matt Russo and Andrew Santaguida of SYSTEM Sounds. — [Chandra sonification pages (search summary)](https://chandra.si.edu/photo/2021/sonify4/)
- A peer-reviewed evaluation (Arcand et al., 2024, *Frontiers in Communication* 9) used three pieces with three scan styles. Galactic Center: glockenspiel/strings/piano, scanned left to right. Cassiopeia A: a string section, X-ray data by element, scanned radially outward. Chandra Deep Field South: synthetic sounds, low/medium/high X-ray energies, scanned bottom to top, with image resolution cut 4× to give more consistent tones. The paper notes the "inverse spectrogram" approach, where one image axis becomes time and the other becomes frequency. — [Arcand et al. 2024, Frontiers](https://www.frontiersin.org/articles/10.3389/fcomm.2024.1288896)

**Earth science (NASA)**
- NASA Earthdata blog "From Data to Melody: Data Sonification and Its Role in Open Science" (Maskey & Maroune, NASA IMPACT; Dec 7, 2023, updated Mar 6, 2026). It sonifies Harmonized Landsat Sentinel-2 (HLS) NDVI for tile 15TVG (central Iowa), 2020-01-15 to 2023-03-05, cloud cover < 30%. NDVI → MIDI chords from C1 to A6, with **higher data values mapped to lower notes**, and NDVI → velocity (loudness) from 35 to 127. The seasonal NDVI cycle is audible. It also sonifies Ed Hawkins' warming stripes (one stripe per year), where the recent warming can be heard. — [NASA Earthdata blog](https://www.earthdata.nasa.gov/news/blog/from-data-melody-data-sonification-its-role-open-science)
- Code: [github.com/NASA-IMPACT/data_sonification](https://github.com/NASA-IMPACT/data_sonification). It is a small Python Streamlit app (`app.py`, `create_music.py`, `create_plot.py`, `data_preprocessing.py`): 18 commits, 5 stars, no license file shown on the repo page. — [GitHub repo page](https://github.com/NASA-IMPACT/data_sonification)
- The blog links a NASA collection called "Explore — From Space to Sound" at https://www.nasa.gov/content/explore-from-space-to-sound. — [NASA Earthdata blog](https://www.earthdata.nasa.gov/news/blog/from-data-melody-data-sonification-its-role-open-science)

**Third-party climate sonifications built on NASA data (good precedents)**
- University of Washington, 2017: an electronic dance track from NASA + NOAA global temperature, 1880–2016, with each note = one year's average. — [UW News](https://www.washington.edu/news/2017/01/18/listen-to-the-earth-smash-another-global-temperature-record)
- Daniel Crawford, "A Song of Our Warming Planet" (2013): NASA GISS surface temperature, 1880–2012, as a cello melody with one note per year (133 years, atonal). He also made a 2013 piece from the Arctic sea-ice volume "death spiral" since 1979. — [Ensia video](https://ensia.com/videos/a-song-of-our-warming-planet/); [AGU 2014 abstract](https://agu.confex.com/agu/fm14/preliminaryview.cgi/Paper8221.html); [Eos](https://eos.org/geofizz/dropping-the-beat-with-some-geoscience-data)
- Judy Twedt (UW dissertation, "Listening to Earth"): includes an Arctic sea ice sonification and a piano score of the satellite sea-ice record. — [UW ResearchWorks](https://digital.lib.washington.edu/researchworks/items/bb9669f6-fca1-4614-b70e-347f3eebe30b)
- Hiroto Nagai: a string quartet from Arctic/Antarctic station records (solar radiation, surface temperature, precipitation, cloud thickness). — [Space.com](https://space.com/30-years-polar-climate-data-converted-to-music)

### Inferences
- The Chandra recipe carries straight over to Earth imagery from GIBS/Worldview (Q4). Sweep left to right through a map, map the value of each pixel or region to pitch and its brightness or magnitude to volume, and give each data layer (e.g., fires vs. vegetation) its own instrument. Publish the layers one at a time, as Chandra does, so judges can learn the mapping.
- The NASA IMPACT NDVI demo uses an inverted polarity (high value = low note). That shows NASA has no single house convention, so a team should state its polarity choice explicitly in a legend.
- For a "jukebox" concept, the strongest NASA-aligned precedents are time series where one note = one year (GISTEMP) and seasonal cycles (NDVI, CO2), because they need almost no data wrangling and the trend is easy to hear.

### Gaps
- I could not load the "Explore — From Space to Sound" page itself, so its contents (and whether it includes Earth science items) are unverified.
- I found no official NASA-produced sonification of sea level, CO2 or Arctic sea ice. Searches surfaced only third-party works. NASA GLOBE and Earth Observatory audio projects did not come up in searches.
- The Arcand et al. 2024 paper sends readers to a companion GitHub repo for exact per-piece mappings. I did not retrieve it.

## 2. Standard sonification techniques and known pitfalls

### Takeaway
There are four core techniques: parameter mapping (data → pitch, loudness, tempo, timbre, pan), audification (play the data samples directly as a waveform), earcons/auditory icons (short symbolic sounds for events), and model-based sonification (data drives a virtual sound-making model that the user "excites"). For a 48-hour hackathon, parameter mapping is the practical default. The big design risks are polarity (which direction "up" means), scale (how much sound change per data change), missing context (no reference tones or legend), and listeners not understanding what they hear.

### Cited Findings
- The standard reference is *The Sonification Handbook* (Hermann, Hunt, Neuhoff, eds., Logos 2011). It is free to read online as whole-book or per-chapter PDFs. Chapters map onto the techniques: Ch. 2 Theory of Sonification (Walker & Nees), Ch. 3 Psychoacoustics (Carlile), Ch. 7 Sonification Design and Aesthetics (Barrass & Vickers), Ch. 12 Audification (Dombois & Eckel), Ch. 13 Auditory Icons (Brazil & Fernström), Ch. 14 Earcons (McGookin & Brewster), Ch. 15 Parameter Mapping Sonification (Grond & Berger), Ch. 16 Model-Based Sonification (Hermann), Ch. 17 Auditory Display in Assistive Technology (Edwards), Ch. 6 Evaluation (Bonebright & Flowers). — [sonification.de/handbook chapter list](https://sonification.de/handbook/chapters/); [publisher listing](https://www.logos-verlag.de/cgi-bin/buch/isbn/2819)
- Open access was made possible by COST Action IC0601 (Sonic Interaction Design). Sound examples are hosted on the same site. — [sonification.de handbook](https://sonification.de/handbook/preface/); [auditory.org release note](https://auditory.org/postings/2011/951.html)
- **Polarity and scale:** Walker's magnitude-estimation method measures *polarity* (does rising pitch mean rising value?) and *scale* (how much sound change per data change). In Walker's 2007 *Applied Cognitive Psychology* study, preferred polarity and scaling **depended on the data concept** (frequency, tempo and modulation index were tested against 10 dimensions, including temperature). — [Walker et al., "A comparison of sonification mappings" (PDF)](https://wirelessrerc.gatech.edu/sites/default/files/publications/walker_et_al_-_a_comparison_of_sonification_mappings.pdf); [Walker PhD research page](https://sonify.psych.gatech.edu/walkerb/research/phd/index.html)
- **Blind vs. sighted listeners:** Walker & Mauney (2010, ACM TACCESS; 45 blind/visually impaired participants) found polarity choices correlated strongly between groups (r = 0.818). However, a polarity that suits sighted users may not suit blind users; early-blind participants preferred a *reversed* polarity for frequency:dollars. — [Universal Design of Auditory Graphs (review)](https://a11y-paradise.onrender.com/reviews/69cdc9269c2cf36d2aa44e9b); [Georgia Tech repository](https://repository.gatech.edu/entities/publication/c4f76dee-4c38-4876-b031-110b0ee212e0)
- **Contradicting evidence:** a 2019 ICAD paper (Ferguson) found that polarities predicted by magnitude estimation, e.g., temperature → pitch, did not always outperform inverted or even random mappings. Treat polarity "rules" as guidance, not law. — [Glasgow eprint](https://eprints.gla.ac.uk/249299/2/249299.pdf)
- **Comprehension pitfall:** in the Universe of Sound survey (3,184 cleaned responses), many listeners misunderstood the relationship between sound and data. Some thought the sounds were real recordings from space, and respondents asked for standardized, interpretable conventions. The authors recommend explaining the mapping and process clearly, and they compare learning to listen to learning to read graphs. — [Arcand et al. 2024](https://www.frontiersin.org/articles/10.3389/fcomm.2024.1288896)
- **Cognitive load:** NASA IMPACT authors recommend splitting data streams across visual and auditory channels to reduce cognitive load. They also call for standardized methods and further study of how sound parameters affect perception. — [NASA Earthdata blog](https://www.earthdata.nasa.gov/news/blog/from-data-melody-data-sonification-its-role-open-science)
- **Mapping to a musical scale:** scisonify bins values into notes of a chosen key ("Fb:min", 3 octaves). Highcharts offers preset pitch scales. Both quantize data to musical notes rather than raw Hz. — [sci-sonify climate example](https://sci-sonify.readthedocs.io/en/latest/examples/01-climate-change.html); [Highcharts advanced mapping](https://highcharts.com.cn/docs/sonification/advanced-mapping)
- **Instrument preference:** Universe of Sound participants generally preferred instrumental sounds over synthetic ones, and the most common emotional responses were "curious," "calm," "interesting" and "relaxed." — [Arcand et al. 2024](https://www.frontiersin.org/articles/10.3389/fcomm.2024.1288896)

### Inferences
- **Pitch is logarithmic:** equal musical steps are equal frequency *ratios*, not equal Hz. Map data linearly onto MIDI note numbers (or a scale), not linearly onto Hz, or the top of the range will sound compressed. This is standard psychoacoustics (Handbook Ch. 3). I did not fetch a specific passage to quote.
- **Too many streams:** keep to about 2–3 simultaneous, clearly different timbres. Chandra gives each layer its own instrument and publishes layers solo first, which is a practical way to avoid "mush."
- **Always give a reference:** play the min/max or a baseline tone before the data, and use a recurring tick or drum for decades/years. Say the mapping out loud ("higher pitch = warmer") at the start. This follows directly from the comprehension problems in the Arcand survey.
- For temperature, "higher = higher pitch" is the intuitive default. NASA IMPACT's inverted NDVI mapping shows a team should test its choice on a few listeners, ideally including a BLV listener.
- **Audification** (playing samples as audio) fits only long, dense, oscillating series (e.g., daily data over decades, seismic-like signals). Short annual series (~145 points) are far too short to audify, so use parameter mapping for those.

### Gaps
- I did not retrieve the specific Handbook passages on context/reference tones (Walker & Nees, Ch. 2) or stream segregation (Ch. 3/4). The pitfall bullets above on log pitch, stream count and reference tones are standard practice, not quoted text.
- I could not confirm the Sonification Handbook's reuse license (the chapters page states none).

## 3. Tools and libraries for building a working sonification in 48 hours

### Takeaway
Fastest web path: **Tone.js** (MIT, Web Audio) for custom interactive audio, or **Highcharts Sonification** for an accessible chart that speaks and plays with almost no audio code. Fastest Python path: **STRAUSS** (actively maintained, JOSS 2025) or **astronify** (beta) to render audio, or **MIDIUtil/mido/music21** to write MIDI that the team then arranges in a DAW. **TwoTone** is a no-code browser tool for prototyping mappings in minutes.

### Cited Findings
**Browser / JavaScript**
- **Tone.js:** open-source Web Audio framework for interactive music in the browser, MIT license, started 2014 by Yotam Mann; repo Tonejs/Tone.js. Sources disagree on the latest version (jsDelivr lists 15.1.22). — [jsDelivr npm/tone](https://www.jsdelivr.com/package/npm/tone); [soundingfuture.com](https://soundingfuture.com/tools/tone.js); [Cloudsmith](https://cloudsmith.com/navigator/npm/tone)
- **Highcharts Sonification:** load `sonification.js` with `highcharts.js`. It adds `Chart.sonify`, `Chart.toggleSonify`, `Series.sonify` and `Point.sonify`. It supports instrument tracks (built-in synth) and **speech tracks**, mapping of data to audio parameters, and preset pitch scales. API classes: `Highcharts.Sonification`, `SonificationInstrument`, `SynthPatch`, `SonificationSpeaker`. — [Getting started](https://www.highcharts.com/docs/sonification/getting-started); [Instruments](https://www.highcharts.com/docs/sonification/instruments); [Mapping](https://www.highcharts.com/docs/sonification/mapping); [API reference](https://api.highcharts.com/class-reference/Highcharts.Sonification)
- **Highcharts Sonification Studio:** BSD-3 open-source app, but it depends on the proprietary Highcharts library. — [GitHub highcharts/sonification-studio](https://www.github.com/highcharts/sonification-studio)
- **TwoTone (twotone.io):** free, open-source, browser-based. Upload data and it auto-generates an audio track; data source and instrument can be changed. Data is processed fully in the browser with no server storage. It works as a PWA, has MIDI output (up to 16 channels) and can run locally via npm. Maintained at github.com/sonifydata/twotone since Dec 2021 (originally datavized/twotone). Built by Datavized/Sonify with Google News Initiative support. Sources disagree on the canonical web URL (twotone.io, app.twotone.io, sonify.io/twotone/). — [GitHub datavized/twotone README](https://github.com/datavized/twotone); [Medium: An Intro to TwoTone](https://medium.com/kinetek/an-intro-to-twotone-dd69305da9c3); [Information is Beautiful Awards](https://www.informationisbeautifulawards.com/showcase/4497)

**Python**
- **STRAUSS** (Sonification Tools and Resources for Analysis Using Sound Synthesis; James Trayford et al.): free, open-source, pip-installable, with presets for quick starts and fine control over audio. Release line 1.0.x. Core dependencies are NumPy and SciPy. Each feature has a tutorial as both a Jupyter notebook and a script. Optional Coqui text-to-speech needs Python ≤ 3.12. Papers: ICAD 2023 and JOSS 2025, 10(109), 7875. — [STRAUSS docs](https://strauss.readthedocs.io/en/latest/); [PyPI strauss 1.0.1](https://pypi.org/project/strauss/1.0.1/); [arXiv 2311.16847](https://arxiv.org/abs/2311.16847); [JOSS paper](https://www.theoj.org/joss-papers/joss.07875/10.21105.joss.07875.pdf)
- **astronify** (STScI): Python sonification of data series. By default it maps the "time" and "flux" columns, but any two columns work: `SoniSeries(table).sonify()` then `.play()`. The docs call it beta and possibly unstable. Known limitation: `play()` does not work from scripts, only in interactive mode. ASCL ascl:2408.005. — [astronify docs](https://astronify.readthedocs.io/en/latest/); [time series tutorial](https://astronify.readthedocs.io/en/py311/astronify/Intro_Astronify_Series.html); [ASCL](https://ascl.net/2408.005)
- **scisonify / sci-sonify** (repo philipc2/sci-sonify): adds an xarray accessor, so `da.sonify(note_length=0.1, wave='sine', smap=DiscreteNoteBins.from_key("Fb:min", octave_range=(3,6)))` sonifies a NetCDF-derived series directly. Its climate example uses NOAAGlobalTemp gridded anomalies, reduced to 143 annual global means. The docs page gives no license or version. — [sci-sonify climate example](https://sci-sonify.readthedocs.io/en/latest/examples/01-climate-change.html)
- **MIDIUtil:** pure-Python MIDI file writer. The latest release is 1.2.1 (2018-03-04), which added pitch bend. There have been no upstream releases since, though Debian still packages it (1.2.1-7, Oct 2025). Works fine but is **not actively developed**. — [piwheels](https://www.piwheels.org/project/midiutil/); [PyPI](https://pypi.org/project/MIDIUtil/); [Debian tracker](https://tracker.debian.org/pkg/python-midiutil)
- **NASA IMPACT data_sonification:** a reference implementation in Python with a Streamlit UI (see Q1). — [GitHub](https://github.com/NASA-IMPACT/data_sonification)

**Directory of examples / inspiration**
- **Data Sonification Archive** (sonification.design): curated collection run by Northeastern's Center for Design with the Deusto Design Research Group, curated by Sara Lenzi and Paolo Ciuccarelli. Launched Jan 2021, ~400 examples, browsable by year and field (hydrology, astronomy, etc.). Submissions are reviewed, not auto-accepted. — [sonification.design](https://sonification.design/); [Northeastern CAMD](https://camd.northeastern.edu/featured-work/data-sonification/); [Goodreads blog post](https://www.goodreads.com/author_blog_posts/22548682-unofficial-channels-data-sonification-archive)
- **ICAD** keeps a sonification examples page. — [icad.org/examples](https://icad.org/examples)

### Inferences
- **Recommended 48-hour stacks:**
  - (a) *Web jukebox:* fetch CSV/JSON in the browser, then play it with Tone.js (`Tone.Synth`/`Sampler`, `Tone.Transport` to schedule one note per data point, `Tone.Panner` for stereo). Fully custom and MIT-licensed.
  - (b) *Accessible chart first:* Highcharts with the sonification module plus speech tracks gives an accessible audio chart for very little code. Check the Highcharts license for your use.
  - (c) *Python pipeline:* pandas, then MIDIUtil or mido to write a `.mid`, then render in a DAW or with FluidSynth. Or use STRAUSS for direct audio.
- **License watch:** Highcharts (core library) is commercial software that is free only under certain conditions. Tone.js, STRAUSS, TwoTone and MIDIUtil are open source, so they are the safer choices if the hackathon requires open licensing.
- **Abandonment flags:** MIDIUtil (no release since 2018; stable but frozen). astronify is labeled beta. TwoTone's repo moved in 2021 and I could not confirm recent commit activity. The NASA-IMPACT repo is small and shows no license.

### Gaps
- **Not verified this session:** licenses and maintenance status for mido, music21, Sonic Pi, SuperCollider, Pure Data, Max/MSP and Ableton Live. From general knowledge (re-check each LICENSE file and site before relying on it): mido (MIT), music21 (BSD-3), Sonic Pi (MIT), SuperCollider (GPL-3.0) and Pure Data (BSD-3) are free and actively maintained; Max/MSP (Cycling '74) and Ableton Live are commercial and paid, with free trials.
- The exact Highcharts license terms and current version weren't fetched. Check [highcharts.com](https://www.highcharts.com/) before use.
- Latest Tone.js version: sources conflict (15.0.4 / 15.1.22 / 15.4.0). Run `npm view tone version`.
- **"sonify (NASA/Python)":** I found no NASA-authored Python package named `sonify`. The closest matches are scisonify (independent, philipc2), NASA-IMPACT/data_sonification (NASA, an app rather than a library), and astronify (STScI, which operates Hubble/Webb for NASA).
- Highcharts Sonification Studio is often credited as co-developed with Georgia Tech's Sonification Lab, but I could not confirm this in this session.

## 4. Easy-to-access NASA (and partner) Earth datasets/APIs for sonification

### Takeaway
For a hackathon, the easiest wins are single-file time series that need no login: **GISTEMP** annual/monthly global temperature (CSV), **NOAA Mauna Loa CO2** (CSV), **NSIDC Sea Ice Index v4** daily extent (CSV), and **NASA GMSL** sea level (ASCII). For live or location-based "jukebox" requests, use the **NASA POWER** point API (JSON/CSV, no key mentioned) and **EONET v3** natural events (JSON/GeoJSON, no key). **FIRMS** fire detections need a free MAP_KEY. **GIBS** gives map imagery for Chandra-style image sonification.

### Cited Findings
| Dataset | Access URL | Format / notes | Source |
|---|---|---|---|
| **GISTEMP v4** global land-ocean temperature anomaly (NASA GISS) | `https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv` (global monthly/annual means, 1880–present) | CSV with a title row above the header (skip 1 line). Caveat: GHCN v4 input lacks recent data from some countries, affecting months from Aug 2025 on. GISS asks users to cite the webpage (with access date) and its latest paper. | [GISTEMP page](https://data.giss.nasa.gov/gistemp/); file path from [code mirror](https://github.yxlr123.workers.dev/climdata/gisTemp) |
| **Mauna Loa CO2 monthly** (NOAA GML, used on NASA Vital Signs) | `https://gml.noaa.gov/aftp/products/trends/co2/co2_mm_mlo.csv` (also `.txt`) | CSV, ~37 KB. Columns (per a mirror): year, month, decimal date, monthly average, deseasonalized, # days, std dev, uncertainty. Monthly means are averages of daily "background" means. Strong seasonal cycle on a rising trend, good for sound. | [GML directory](https://gml.noaa.gov/aftp/products/trends/co2); [GML trends](https://www.gml.noaa.gov/ccgg/trends); [Kaggle mirror schema](https://baselight.app/u/kaggle/dataset/jarredpriester_noaa_monthly_co2_ppm) |
| NASA Vital Signs: CO2 | earth.gov Vital Signs page with "Download data" button (snapshot: July 2025, 428 ppm) | — | [earth.gov Vital Signs CO2](https://earth.gov/sealevel/vital-signs/carbon-dioxide/) |
| **Arctic/Antarctic sea ice extent**: NSIDC Sea Ice Index G02135 **v4** | Files `N_seaice_extent_daily_v4.0.csv` / `S_seaice_extent_daily_v4.0.csv` (~1.7 MB each) in the NOAA/G02135 daily data directories; XLSX workbook `Sea_Ice_Index_Daily_Extent_G02135_v4.0.xlsx` (2026-05-26) | CSV, daily, 26 Oct 1978–present. v4 uses AMSR2 input; v3 links are stale. | [NSIDC G02135](https://nsidc.org/data/g02135); [S daily dir](https://masie_web.apps.nsidc.org/pub/DATASETS/NOAA/G02135/south/daily/data/); [seaice_analysis dir](https://masie_web.apps.nsidc.org/pub/DATASETS/NOAA/G02135/seaice_analysis); [v4 user guide](https://nsidc.org/sites/default/files/documents/user-guide/g02135-v004-userguide.pdf) |
| **Global mean sea level** (satellite altimetry) | PO.DAAC multi-mission GMSL (TOPEX/Jason-1/2/3/Sentinel-6), v5.2, DOI 10.5067/GMSLM-TJ152 (a newer version may exist); NASA-SSH `NASA_SSH_GMSL_INDICATOR.txt` (always the latest, cm) | ASCII table. PO.DAAC is migrating into Earthdata, so URLs may change. NASA hub: sealevel.nasa.gov. | [PO.DAAC globally averaged sea level](https://podaac.jpl.nasa.gov/Globally-averaged-sea-level); [NASA-SSH GMSL on data.nasa.gov](https://data.nasa.gov/dataset/nasa-ssh-global-mean-sea-level-from-simple-gridded-sea-surface-height); [PO.DAAC v5.1 announcement](https://podaac.jpl.nasa.gov/announcements/2021-11-04-GMSL-Trend-from-Integrated-Multi-Mission-Ocean-Altimeters-T/P-Jason-1-2-3-V5.1-Dataset-Release) |
| **NASA POWER** (daily weather/solar for any lat/lon) | `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M&community=SB&longitude=0&latitude=0&start=20170101&end=20170201&format=JSON` | JSON, CSV, ASCII, NetCDF (ICASA for the AG community). Max 20 parameters per point request. No API key mentioned. Apps that repeatedly hit the same location may be blocked, so cache results. Options: `time-standard=UTC/LST`, `site-elevation`, `wind-elevation`. | [POWER daily API docs](https://power.larc.nasa.gov/docs/services/api/temporal/daily/) |
| **EONET v3** natural events (wildfires, storms, volcanoes, ice…) | `https://eonet.gsfc.nasa.gov/api/v3/events` (+ `/events/geojson`, categories, layers) | JSON/GeoJSON. Filters: source, category, status (default open only; `status=all` includes closed), limit, days, start/end. Event fields: id, title, description, link, closed, categories, sources. Older tutorials use v2.1 on a different host. | [EONET v3 docs](https://eonet.gsfc.nasa.gov/docs/v3); [sample](https://eonet.gsfc.nasa.gov/api/v3/events?days=20) |
| **FIRMS** active fires (MODIS/VIIRS) | `https://firms.modaps.eosdis.nasa.gov/api/area/csv/[MAP_KEY]/[SOURCE]/[AREA_COORDINATES]/[DAY_RANGE]/[DATE?]`, e.g. SOURCE=`VIIRS_SNPP_NRT` | CSV. Free MAP_KEY required. One client library cites 5,000 transactions per 10 minutes. Intermittent 504s have been reported, so build in retries. | [FIRMS area API](https://firms.modaps.eosdis.nasa.gov/api/area/csv); [Earthdata forum 504 thread](https://forum.earthdata.nasa.gov/viewtopic.php?p=23833); [rate limit per WildfireData.jl](https://rallypointone.github.io/WildfireData.jl/dev/modules/firms.html) |
| **GIBS** (imagery behind Worldview) | WMTS/WMS at gibs.earthdata.nasa.gov; layer IDs like `MODIS_Terra_Aerosol_Optical_Depth_v6_STD`. If no time is given, the default date is used. | Image tiles (PNG/JPEG). The current docs are on GitHub; older wiki pages have moved. WMS has better time support in GIS clients. | [GIBS API docs](https://nasa-gibs.github.io/gibs-api-docs); [Earthdata GIBS](https://www.earthdata.nasa.gov/gibs) |
| **HLS NDVI** (Landsat/Sentinel-2) | Via Earthdata (as in the NASA IMPACT demo) | Requires Earthdata Login and raster processing, which takes more effort. | [HLS](https://www.earthdata.nasa.gov/esds/harmonized-landsat-sentinel-2); [Earthdata blog](https://www.earthdata.nasa.gov/news/blog/from-data-melody-data-sonification-its-role-open-science) |

- NASA data are open, but an **Earthdata Login** is required to download data and to use some tools with full functionality. — [Earthdata Climate Indicators data access](https://www.earthdata.nasa.gov/topics/climate-indicators/data-access-tools?page=0%2C8)
- NOAAGlobalTemp gridded NetCDF (1880–2022, 36×72 grid) is a worked sonification example in scisonify, reduced to 143 annual global means. — [sci-sonify example](https://sci-sonify.readthedocs.io/en/latest/examples/01-climate-change.html)

### Inferences
- **Best "first song" datasets:**
  - GISTEMP annual means: about 145 notes, so roughly 30 s at 0.2 s per note. The warming trend is obvious.
  - Mauna Loa CO2 monthly: the seasonal wobble on a rising trend is musically interesting (melody + bass drone).
  - Sea Ice Index daily: hear the annual melt/freeze cycle, with the minimum getting lower over decades. Good for a "loop per year" rhythm.
- **Interactive jukebox ideas:**
  - A user picks a location, POWER returns daily T2M/precipitation for that place, which becomes a song.
  - EONET or FIRMS events become percussion hits or earcons (one sound per event category).
  - GIBS imagery is swept left to right, Chandra style.
- POWER, EONET, GML and the NSIDC files need no login. FIRMS needs a free key. HLS/Earthdata needs a login. Choose the no-login sources to save setup time. Check CORS for browser-side fetches, and if blocked, proxy or pre-download the files.

### Gaps
- I did not verify CORS headers for any endpoint (this matters for a pure-browser app).
- I did not confirm a direct NASA-hosted CSV for the Arctic sea ice minimum or sea level on climate.nasa.gov/science.nasa.gov Vital Signs. The NSIDC and PO.DAAC files above are the underlying sources.
- The exact column layouts of the NSIDC daily CSV and the GMSL ASCII file were not checked. See the user guides.
- POWER parameter names other than T2M/WS10M/PS (e.g., PRECTOTCORR, ALLSKY_SFC_SW_DWN) were not confirmed on the page I read. Check the POWER parameter dictionary.
- api.nasa.gov (DEMO_KEY, key signup) was not researched.

## 5. Design and accessibility guidance

### Takeaway
The evidence and NASA's own practice point to a few rules:
- Co-design with blind and low-vision (BLV) users.
- Explain the mapping up front (audio legend + narration), and publish layers separately.
- Prefer instrumental timbres.
- Pair sound with visuals rather than overloading one channel.
- Test the polarity with real listeners, including BLV ones, because preferences differ by data type and population.

### Cited Findings
- **Co-design:** NASA's Universe of Sound was shaped by members of the BLV community. Its layers are published with explanations of what each layer does, for transparency. — [NASA Science](https://science.nasa.gov/open-science/astronomy-data-sonification/)
- **Evaluation evidence** (Arcand et al. 2024; 4,346 responses collected, 3,184 after cleaning; online, Feb 2021):
  - Most participants enjoyed the pieces, with no significant BLV vs. sighted difference.
  - BLV participants reported learning more (significant only for Cassiopeia A, p = 0.024).
  - BLV participants were more motivated to learn more (p = 0.047).
  - Trust was the weakest rating among BLV participants, which the authors flag as the key area to improve.
  - The authors recommend clear descriptions of the mapping and creation process, standardized mappings, and universal design for learning.
  - Limitations: convenience sample, few BLV respondents, self-reported learning.
  — [Arcand et al. 2024, Frontiers in Communication](https://www.frontiersin.org/articles/10.3389/fcomm.2024.1288896)
- **Population differences:** polarity preferences correlate between blind and sighted listeners (r = 0.818), but they are not identical. Early-blind listeners reversed polarity for some mappings, so test with the target users. — [Walker & Mauney 2010 summary](https://a11y-paradise.onrender.com/reviews/69cdc9269c2cf36d2aa44e9b)
- **Multimodal split:** NASA IMPACT advises splitting data streams across visual and auditory channels to reduce cognitive load. It also wants sonification that makes sense to people with little science background, and tools that non-specialists can customize. — [NASA Earthdata blog](https://www.earthdata.nasa.gov/news/blog/from-data-melody-data-sonification-its-role-open-science)
- **Built-in speech:** Highcharts speech tracks let a chart announce values or labels alongside the tones, a ready-made way to give an audio legend. — [Highcharts instruments docs](https://www.highcharts.com/docs/sonification/instruments)
- **Privacy:** TwoTone processes uploaded data fully in the browser with no server storage. That is a useful model if users upload their own data. — [TwoTone README](https://github.com/datavized/twotone)
- **Core references:**
  - *Sonification Handbook*, especially Ch. 7 Design and Aesthetics, Ch. 6 Evaluation, Ch. 17 Assistive Technology, Ch. 2 Theory. — [sonification.de/handbook](https://sonification.de/handbook/chapters/)
  - **ICAD** (International Community for Auditory Display): the main research community, with an examples page. — [icad.org/examples](https://icad.org/examples)
  - **Data Sonification Archive**, for design patterns. — [sonification.design](https://sonification.design/)
  - Georgia Tech Sonification Lab (Walker) publications on auditory graphs and mappings. — [sonify.psych.gatech.edu](https://sonify.psych.gatech.edu/walkerb/research/phd/index.html)

### Inferences
- **Practical accessibility checklist for the team:**
  1. A spoken intro and legend ("each note is one year; higher pitch = warmer; a drum marks each decade").
  2. Play/pause/scrub controls that work by keyboard and are labeled for screen readers (ARIA), with no autoplay.
  3. A reference tone for baseline/zero.
  4. A solo/mute toggle per data layer.
  5. Adjustable speed.
  6. A text/table alternative and captions for any video.
  7. Avoid very low (< ~60 Hz) or harsh high pitches on laptop speakers.
  8. Test with at least one BLV listener if possible.
- Say explicitly that the sounds are *made from data* and are not recordings. The Arcand study found people assume space sounds are real recordings, and the same confusion is likely with "sounds of Earth."

### Gaps
- I did not find a formal NASA or W3C standard specifically for sonification accessibility. The guidance above comes from research papers and NASA practice.
- ICAD's own design guidelines or checklists (if any exist beyond papers) were not located in this session.
- I did not retrieve the Sonification Handbook Ch. 17 (Assistive Technology) text, so no specific recommendations are quoted from it.
