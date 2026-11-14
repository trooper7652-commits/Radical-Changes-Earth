# Happiness data sources and BLV testing: facts and options only

Compiled 2026-11-14. Facts and options only; no recommendation. Items marked UNVERIFIED came from search snippets or background knowledge, not from reading the primary page. Check them before citing.

## Task A. Happiness (public opinion) data and models

### A1. Light-pollution / dark-sky opinion surveys

| Source | Sample, date, coverage | Percent-able number? | License/format | Flags |
|---|---|---|---|---|
| Cieraad & Dalley, People and Nature 8(1):197-209, doi:10.1002/pan3.70212 (2026) | Online survey, n=1,000 adults, broadly representative of NZ adults | Yes. Search snippet: at least 31% wanted lighting "on only when needed". Full text not read. | Journal article, not a raw dataset. License UNVERIFIED. | Only representative-sample light-pollution paper found. One country. Raw data availability UNVERIFIED. |
| Irish citizen-science survey, PMC7432530 (Int. J. Environ. Res. Public Health 2020) | n=464, 2018, Ireland, recruited through a newspaper | Yes, e.g. 7.6% said sky "completely dark", 33.8% regularly see Milky Way, 61.9% name public lighting as the brightest source. These are sky observations, not opinion on whether light pollution is "bad". | Open-access article | NOT large-sample, convenience sample. Authors say not generalisable. |
| CPRE UK campaign survey (Country Life article) | n=1,745, undated in the result | 83% say night sky view is affected | News article | NOT a neutral poll (advocacy group). Date unknown. |
| Lyytimaki & Rinne 2013 online survey (Leiden repository, "Voices for the darkness") | n=2,053 | Mostly qualitative or attitude scales | Journal article | Self-selected, mostly educated urban, astronomy/environment-interested. |
| Global expert vs public survey (inside.lighting summary, Oct 2025) | 230 people, 32 countries | Ratings, not a single percent | Summary page | Small. Compares experts and non-experts. |
| French municipal switch-off study | 91 residents, one town | Attitude scales | Journal article | Very small, local. |

Finding: no large, representative US, EU, or global poll with a headline "percent who oppose light pollution" turned up. I did not search every national polling firm, so this is not proof none exists.

### A2. Broader environment / climate opinion (large samples)

| Source | Facts | License / terms | Format |
|---|---|---|---|
| Lloyd's Register Foundation World Risk Poll (Gallup fieldwork) | 2019 poll: about 150,000 interviews, 142 countries. 2024 edition: about 143,000-147,000 people, 140-142 countries (sources differ). Includes 2026 report "Alone Together: The Hidden Consensus on Climate Change" with UNDP. | "Freely available to download and use (with attribution)". They ask users to email them. UK Data Service record shows a Creative Commons logo, exact version UNVERIFIED. | Full datasets plus data dictionary, interactive Data Explorer |
| Yale Climate Opinion Maps (YPCCC) | US counties (3,142), 2024 version uses surveys from 2008-2024. County margin of error about 8 points on average. Respondent counts vary by source (18,000+ and 24,000+ cited for older versions). | Custom license: limited, revocable, non-transferable. Research/academic, internal business, or personal non-commercial use. No redistribution or resale. Download needs a data download agreement form. | Downloads via agreement form (also a YCOM_2024_AI_data.jsonld file appeared in results) |
| Yale "Climate Change in the American Mind" (Spring 2026) | US only, national survey series | Terms UNVERIFIED | Reports |
| Pew (US climate survey, March 16-22, 2026) | 3,524 US adults | Pew's usual terms UNVERIFIED | Reports and datasets |
| Ipsos "People and Climate Change 2026" | 31 countries | Commercial pollster, terms UNVERIFIED | Report |
| Eurobarometer (climate/environment special surveys) | Not found in search. From background knowledge, EU-wide, roughly 1,000 per country. UNVERIFIED. | UNVERIFIED | UNVERIFIED |
| Meta-Yale global survey | 100,000+ Facebook users, about 200 countries (older study) | UNVERIFIED | Self-selected platform sample, flag as not a probability sample |

Flag: the Yale Opinion Maps license is restrictive (no redistribution). Whether it covers a public hackathon site is for the team to check. Calling it a "no" or "yes" is not something I can determine.

### A3. ML models for sentiment / opinion scores

| Model | License | Notes |
|---|---|---|
| cardiffnlp/twitter-roberta-base-sentiment-latest (huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest) | cc-by-4.0 per HF page | Text to negative/neutral/positive. Trained on tweets. ONNX file exists only in a community pull request (refs/pr/24), not main. A separate repo onnx-community/twitter-roberta-base-sentiment-ONNX is for the older non-"latest" model (its license not verified). |
| climatebert/distilroberta-base-climate-sentiment | Apache-2.0 per HF page | Classifies paragraphs as opportunity/neutral/risk (not like/dislike). Card says it may do worse on single sentences. Training dataset climatebert/climate_sentiment license UNVERIFIED. A derivative on HF lists CC BY-NC-SA 4.0, which would forbid commercial use. |
| KevSun/climate-attitude-LM | UNVERIFIED | Appeared in results, not examined. |
| PerceptCLIP-Emotions (image) | UNVERIFIED | Predicts emotions an image evokes in viewers. Not public opinion about a topic. |
| dennisjooo/emotion_classification (image) | Apache-2.0 | ViT, 8 labels, about 0.67 accuracy |
| yangswei/visual-emotion-classification (image) | UNVERIFIED | About 0.58-0.62 accuracy, sparse model card |

Facts on images: no ready-made open model found that estimates public sentiment about a topic from an image. Image models found classify emotion evoked by, or shown in, a picture.

Java: ONNX Runtime has an official Java API (Maven `com.microsoft.onnxruntime:onnxruntime`, CPU build, native libs bundled; Windows/Linux/macOS x64 per the docs page). DJL has an ONNX Runtime engine (`ai.djl.onnxruntime:onnxruntime-engine`, 0.31.0 documented). Hugging Face tokenizer use from DJL not verified. Model sizes not checked, though roberta-base-class models are on the order of hundreds of MB (UNVERIFIED).

Biggest caveat: a text-sentiment model scores a piece of text, not a world consensus. A survey gives the consensus number.

## Task B. Testing with blind and low-vision (BLV) listeners

### B1. Methods
- Lab protocol seen in a BLV histogram-sonification study (arXiv 2509.14452): welcome, consent, tutorial, counterbalanced tasks, exit interview.
- Remote, unsupervised: a sonification study with 18 blind participants used a gamified mobile app and collected 149 tests in under two weeks (found via Susurrus/ICAD-type literature; paper title not captured in my search, UNVERIFIED which one).
- Small mixed-ability pitch study: 26 participants, 10 BLV, four data-perception tasks (ICAD 2021 paper).
- Susurrus (cs.au.dk/~elm/pdf/susurrus.pdf): 12 BLV participants, compared with existing tools.
- NASA data sonification survey, Frontiers in Communication 2024, "A Universe of Sound", 3,184 sighted and BLV respondents (survey design).
- Practitioner note (NN/g "mobile accessibility research", userinterviews.com): BLV participants may need more time per task. Plan for longer sessions.
- Simple option patterns (general UX practice, not a single cited protocol): short A/B listening question ("which clip sounds happier / sadder?"), a 1-5 rating, and a free-text comment, run by phone/video or a screen-reader-accessible form.
- Ethics basics: no BLV-specific consent text found in my search. Generic IRB-style items include informed consent, voluntary participation, right to stop, no names or personal data kept. UNVERIFIED for this setting. A hackathon is not an IRB-reviewed study, so ask the event organizers how they handle this.

### B2. Online communities (rules about recruiting)
- AppleVis (applevis.com): runs its own community surveys (2024: open to registered users, 10 questions). I could not read its posting guidelines (page returned 403), so recruitment rules are UNKNOWN.
- r/Blind on Reddit: rules not retrievable (Reddit blocked). Other support subreddits often ban or require moderator approval for surveys. Recruitment rules for r/Blind UNKNOWN, modmail would settle it.
- Be My Eyes (bemyeyes.com): connects BLV users with sighted volunteers via video; I found no research-recruitment route. Volunteers are sighted, so it is not a BLV tester pool.
- NFB IL-Talk mailing list (nfbnet.org/pipermail/il-talk_nfbnet.org): public archive of NFB Illinois announcements. List rules for outside posts UNKNOWN.
- Not looked up: Aira, ACB Community mailing lists, Blind Bargains, Mastodon.

### B3. Chicago-area organizations

| Org | Address | Weekend Nov 14-15 | Testing process |
|---|---|---|---|
| The Chicago Lighthouse | 1850 W. Roosevelt Rd., Chicago 60608. (312) 666-1331, contactus@chicagolighthouse.org | Hours listed Mon-Fri 8-5, no weekend hours listed (so presumably closed) | No intake process found. It runs a "DAX" (Digital Accessible Experience) team of BLV usability testers, a paid consulting service per WTTW, and partners with AFB Consulting. No DAX contact on the contact page. |
| Second Sense | 1 N LaSalle St, Suite 3300, Chicago 60602. 312-236-8569 | Closed weekends (open Mon-Fri 8:30-4:30) | No research-request process on the contact page. It lists volunteer opportunities. |
| NFB of Illinois | 5128 N. Oak Park Ave., Chicago 60656. 312-343-8396 (directory listings) | Not stated | None found. Chicago Chapter minutes (2024) show monthly meetings. President named as of 2024 may be out of date. |
| Illinois Council of the Blind (ACB affiliate) | PO Box 82, Riverton, IL 62561. 217-523-4967, icb@icbonline.org. Has an "American Council of the Blind - Metro Chicago" chapter on icbonline.org/affiliates | Not stated | None found. |

### B4. Space Apps Chicago 2026 page
Fetched via r.jina.ai: Nov 14-15, venue 1 West Monroe Street, Chicago ("The Ferris", hosted by Ferris & Co.), partner: Northwestern CIERA. No mentor list. No mention of accessibility accommodations, ASL, or accessibility mentors. Contacts: NASASpaceAppsChicago@gmail.com, info@spaceappschallenge.org. No CIERA accessibility-mentor listing was found.

## Biggest gaps
- No large representative poll specifically on light-pollution opinion beyond New Zealand (n=1,000); the full text and data not read.
- License terms for most polls and several models unverified.
- r/Blind, AppleVis rules unreadable; no confirmed way to recruit BLV testers within 24 hours.
- All Chicago BLV organizations appear to be closed on the weekend; Mon-Fri hours only.

## Sources
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7432530/
- https://doi.org/10.1002/pan3.70212 (NZ study, 2026)
- https://www.countrylife.co.uk/news/light-pollution-blighting-night-sky-views-23438
- https://agris.fao.org/search/en/records/65df43ce63b8185d9cabcd29
- https://inside.lighting/news/25-10/weve-lit-our-way-complex-problem
- https://www.lrfoundation.org.uk/world-risk-poll-data
- https://www.lrfoundation.org.uk/publications/alone-together-the-hidden-consensus-on-climate-change
- https://climatecommunication.yale.edu/visualizations-data/climatenews2020
- https://climateadvocacylab.org/yale-climate-maps/faqs
- https://climatecommunication.gmu.edu/all/climate-change-in-the-american-mind-beliefs-attitudes-spring-2026/
- https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
- https://huggingface.co/onnx-community/twitter-roberta-base-sentiment-ONNX
- https://huggingface.co/climatebert/distilroberta-base-climate-sentiment
- https://huggingface.co/PerceptCLIP/PerceptCLIP_Emotions
- https://huggingface.co/dennisjooo/emotion_classification
- https://onnxruntime.ai/docs/get-started/with-java.html
- https://djl.ai/engines/onnxruntime/onnxruntime-engine
- https://arxiv.org/pdf/2509.14452
- https://cs.au.dk/~elm/pdf/susurrus.pdf
- https://icad2021.icad.org/wp-content/uploads/2021/06/ICAD_2021_5.pdf
- https://www.frontiersin.org/articles/10.3389/fcomm.2024.1288896
- https://www.nngroup.com/articles/mobile-accessibility-research/
- https://news.wttw.com/node/35073
- https://chicagolighthouse.org/contact/
- https://www.second-sense.org/contact
- https://eyespy.org/directory/national-federation-of-the-blind-illinois
- https://www.nfbnet.org/pipermail/il-talk_nfbnet.org/2024-September/024898.html
- https://icbonline.org/ and https://www.icbonline.org/affiliates/
- https://applevis.com/blog/closed-share-your-feedback-take-2024-applevis-community-survey-help-us-serve-you-better-coming
- https://www.bemyeyes.com
- https://www.spaceappschallenge.org/2026/local-events/chicago/
