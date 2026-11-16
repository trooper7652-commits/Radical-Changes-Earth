# Websites and resources used for Radical changes

Compiled 2026-11-15 from the repo's credits, the sample licences, the website and the planning research. Licences and details: `CREDITS.md`, `site/samples/LICENSES.md`, `SI_DISCLOSURE.md`.

## 1. Used in the project itself

**NASA data (Space Apps Resources tab)**
- NASA Scientific Visualization Studio, "Change in Night Lights 2012-2023" (SVS 5313): https://svs.gsfc.nasa.gov/5313/
  - The 7 frames the song is made from, the demo video's visuals, and the map on the website's turning Earth.

**Facts behind the music rules**
- Wikipedia, "Light pollution" (basis for the happiness rule): https://en.wikipedia.org/wiki/Light_pollution
- Hooktheory, "Key popularity" (the order of the keys): https://www.hooktheory.com/cheat-sheet/key-popularity

**Instrument recordings (all real recordings, none AI-made)**
- Versilian Studios, VSCO 2 Community Edition, CC0 (harp, glockenspiel, sustain strings, string bass, oboe): https://github.com/sgossner/VSCO-2-CE
- Versilian Community Sample Library (VCSL), CC0 (pipe organ, balafon): https://github.com/sgossner/VCSL
- FreePats, CC0 (hang drum, guitar, bagpipes): https://freepats.zenvoid.org
  - https://freepats.zenvoid.org/ChromaticPercussion/hang.html
  - https://freepats.zenvoid.org/Guitar/acoustic-guitar.html
  - https://freepats.zenvoid.org/Ethnic/bagpipe.html
  - https://github.com/freepats/hang-D-minor
  - https://github.com/freepats/spanish-classical-guitar
  - https://github.com/freepats/bagpipe
- Salamander Grand Piano by Alexander Holm, CC BY 3.0, as hosted by Tone.js: https://tonejs.github.io/audio/salamander/
- FluidR3 GM SoundFont by Frank Wen, MIT, via midi-js-soundfonts (choir, whistle, pan pipes; picker only): https://github.com/gleitz/midi-js-soundfonts
- Licences: https://creativecommons.org/publicdomain/zero/1.0/, https://creativecommons.org/licenses/by/3.0/, https://opensource.org/licenses/MIT

**Quote**
- Niels Bohr, as portrayed in the film *Oppenheimer* (2023).

## 2. Software, fonts and hosting

- Tone.js (in-browser audio), MIT: https://tonejs.github.io, loaded from cdnjs: https://cdnjs.cloudflare.com/ajax/libs/tone/15.1.22/Tone.js
- Google Fonts (Archivo, Atkinson Hyperlegible Next, Atkinson Hyperlegible Mono; SIL Open Font License): https://fonts.google.com
- GitHub (code hosting): https://github.com/trooper7652-commits/Radical-Changes-Earth
- Vercel (website hosting): https://vercel.com, with the site at https://radical-changes.vercel.app
- Java (OpenJDK) for the analyzer. Playwright for tests (https://playwright.dev). FFmpeg via imageio-ffmpeg (https://pypi.org/project/imageio-ffmpeg/) for the video.

## 3. References for style (inspiration only, nothing copied)

- fabric.vc, for type scale, spacing rhythm and accent discipline (no assets or copy taken): https://www.fabric.vc/
- "Dreiton" by C418, the team's reference for a well-composed sound (nothing sampled).

## 4. AI tools (full detail in SI_DISCLOSURE.md and SI_LOG.md)

- Anthropic Claude via Claude Code (https://claude.ai): Claude Opus 5.5, Claude Sonnet 5.5, Claude Haiku 5.5, Claude Fable 5.2.
- FreeLLMAPI (a local gateway to free AI models; one free model attempted code on 2026-11-15, exact provider model not recorded).
- AI design skills: Impeccable, unslop by Damir Sokolovsky (CC BY 4.0, https://heydamir.design/unslop, https://x.com/heydamir), emil-design-eng, design-taste-frontend, ui-ux-pro-max, frontend-design, web-design-guidelines, playwright-cli. NVIDIA SkillSpector was used to check them for safety before install.

## 5. Consulted during planning research (background reading; not used in the final product)

**NASA and Earth-data portals**
- https://www.earthdata.nasa.gov/gibs
- https://nasa-gibs.github.io/gibs-api-docs
- https://www.earthdata.nasa.gov/esds/harmonized-landsat-sentinel-2
- https://www.earthdata.nasa.gov/news/blog/from-data-melody-data-sonification-its-role-open-science
- https://www.earthdata.nasa.gov/topics/climate-indicators/data-access-tools?page=0%2C8
- https://forum.earthdata.nasa.gov/viewtopic.php?p=23833
- https://eonet.gsfc.nasa.gov/docs/v3
- https://eonet.gsfc.nasa.gov/api/v3/events
- https://firms.modaps.eosdis.nasa.gov/api/area/csv
- https://data.giss.nasa.gov/gistemp/
- https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv
- https://data.nasa.gov/dataset/nasa-ssh-global-mean-sea-level-from-simple-gridded-sea-surface-height
- https://podaac.jpl.nasa.gov/Globally-averaged-sea-level
- https://podaac.jpl.nasa.gov/announcements/2021-11-04-GMSL-Trend-from-Integrated-Multi-Mission-Ocean-Altimeters-T/P-Jason-1-2-3-V5.1-Dataset-Release
- https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- https://earth.gov/sealevel/vital-signs/carbon-dioxide/
- https://www.nasa.gov/content/explore-from-space-to-sound
- https://science.nasa.gov/open-science/astronomy-data-sonification/
- https://plus.nasa.gov/video/listen-to-the-universe/
- https://github.com/NASA-IMPACT/data_sonification
- https://chandra.harvard.edu/sound/
- https://chandra.harvard.edu/photo/2024/sonify8/animations.html
- https://chandra.cfa.harvard.edu/sound/vela.html
- https://chandra.si.edu/photo/2021/sonify4/
- https://chandra.si.edu/sound/casa_multi.html
- https://nsidc.org/data/g02135
- https://nsidc.org/sites/default/files/documents/user-guide/g02135-v004-userguide.pdf
- https://masie_web.apps.nsidc.org/pub/DATASETS/NOAA/G02135/seaice_analysis
- https://gml.noaa.gov/aftp/products/trends/co2/co2_mm_mlo.csv
- https://www.gml.noaa.gov/ccgg/trends
- https://www.spaceappschallenge.org/2026/local-events/chicago/

**Sonification methods and tools**
- https://sonification.de/handbook/chapters/
- https://sonification.de/handbook/preface/
- https://sonification.design/
- https://icad.org/examples
- https://icad2021.icad.org/wp-content/uploads/2021/06/ICAD_2021_5.pdf
- https://sonify.psych.gatech.edu/walkerb/research/phd/index.html
- https://wirelessrerc.gatech.edu/sites/default/files/publications/walker_et_al_-_a_comparison_of_sonification_mappings.pdf
- https://repository.gatech.edu/entities/publication/c4f76dee-4c38-4876-b031-110b0ee212e0
- https://auditory.org/postings/2011/951.html
- https://www.highcharts.com/docs/sonification/getting-started
- https://www.highcharts.com/docs/sonification/mapping
- https://www.highcharts.com/docs/sonification/instruments
- https://api.highcharts.com/class-reference/Highcharts.Sonification
- https://highcharts.com.cn/docs/sonification/advanced-mapping
- https://www.github.com/highcharts/sonification-studio
- https://strauss.readthedocs.io/en/latest/
- https://pypi.org/project/strauss/1.0.1/
- https://astronify.readthedocs.io/en/latest/
- https://sci-sonify.readthedocs.io/en/latest/examples/01-climate-change.html
- https://ascl.net/2408.005
- https://www.theoj.org/joss-papers/joss.07875/10.21105.joss.07875.pdf
- https://github.com/datavized/twotone
- https://medium.com/kinetek/an-intro-to-twotone-dd69305da9c3
- https://pypi.org/project/MIDIUtil/
- https://www.piwheels.org/project/midiutil/
- https://tracker.debian.org/pkg/python-midiutil
- https://www.jsdelivr.com/package/npm/tone
- https://cloudsmith.com/navigator/npm/tone
- https://soundingfuture.com/tools/tone.js
- https://camd.northeastern.edu/featured-work/data-sonification/
- https://cs.au.dk/~elm/pdf/susurrus.pdf
- https://eprints.gla.ac.uk/249299/2/249299.pdf
- https://arxiv.org/abs/2311.16847
- https://arxiv.org/pdf/2509.14452
- https://www.frontiersin.org/articles/10.3389/fcomm.2024.1288896
- https://agu.confex.com/agu/fm14/preliminaryview.cgi/Paper8221.html
- https://eos.org/geofizz/dropping-the-beat-with-some-geoscience-data
- https://ensia.com/videos/a-song-of-our-warming-planet/
- https://www.washington.edu/news/2017/01/18/listen-to-the-earth-smash-another-global-temperature-record
- https://digital.lib.washington.edu/researchworks/items/bb9669f6-fca1-4614-b70e-347f3eebe30b
- https://space.com/30-years-polar-climate-data-converted-to-music
- https://www.informationisbeautifulawards.com/showcase/4497
- https://www.goodreads.com/author_blog_posts/22548682-unofficial-channels-data-sonification-archive
- https://www.logos-verlag.de/cgi-bin/buch/isbn/2819

**Accessibility and blind/low-vision communities**
- https://www.nngroup.com/articles/mobile-accessibility-research/
- https://a11y-paradise.onrender.com/reviews/69cdc9269c2cf36d2aa44e9b
- https://applevis.com/blog/closed-share-your-feedback-take-2024-applevis-community-survey-help-us-serve-you-better-coming
- https://www.bemyeyes.com
- https://www.nfbnet.org/pipermail/il-talk_nfbnet.org/2024-September/024898.html
- https://eyespy.org/directory/national-federation-of-the-blind-illinois
- https://chicagolighthouse.org/contact/
- https://www.second-sense.org/contact
- https://icbonline.org/ and https://www.icbonline.org/affiliates/
- https://news.wttw.com/node/35073

**Light pollution, climate attitudes and "happiness" research**
- https://www.countrylife.co.uk/news/light-pollution-blighting-night-sky-views-23438
- https://inside.lighting/news/25-10/weve-lit-our-way-complex-problem
- https://doi.org/10.1002/pan3.70212
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7432530/
- https://agris.fao.org/search/en/records/65df43ce63b8185d9cabcd29
- https://www.lrfoundation.org.uk/world-risk-poll-data
- https://www.lrfoundation.org.uk/publications/alone-together-the-hidden-consensus-on-climate-change
- https://climatecommunication.yale.edu/visualizations-data/climatenews2020
- https://climatecommunication.gmu.edu/all/climate-change-in-the-american-mind-beliefs-attitudes-spring-2026/
- https://climateadvocacylab.org/yale-climate-maps/faqs
- https://baselight.app/u/kaggle/dataset/jarredpriester_noaa_monthly_co2_ppm

**AI models researched for a "happiness" model (none used; the team chose a pixel-brightness rule)**
- https://huggingface.co/PerceptCLIP/PerceptCLIP_Emotions
- https://huggingface.co/dennisjooo/emotion_classification
- https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
- https://huggingface.co/onnx-community/twitter-roberta-base-sentiment-ONNX
- https://huggingface.co/climatebert/distilroberta-base-climate-sentiment
- https://onnxruntime.ai/docs/get-started/with-java.html
- https://djl.ai/engines/onnxruntime/onnxruntime-engine
