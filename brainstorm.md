Brainstorm




Parts of the photo -> music elements


Machine Learning -> Values -> Music Software Integration

MAKE A WEBSITE
The user will be able to choose from 7 pre-picked images and they will also be able to upload their own image.

Percussion (doesn't have to always be there)
Bass
Melody
Some filler maybe

Tempo
Pitch
Instruments
-strings
-harp
-bells
-string bass
-bagpipes
-synth
-drums (kick, hi hat, click, snare, toms)
-piano
-choir
-pipes
-guitar
-whistle

What key signature (C-F)
https://www.hooktheory.com/cheat-sheet/key-popularity
Major
C Major
D Major 
G Major 
A Major 
E Major 
F Major 
E♭ Major 
B♭ Major 
D♭ Major 
B Major
F♯ Major 
A♭ Major 
Minor
A Minor
E Minor
C Minor
D Minor
B Minor
G Minor
C♯ Minor
F♯ Minor
F Minor
D♯ Minor 
B♭ Minor
G♯ Minor

Variables: 7 total
Vibrancy
HSV
More vibrant = Fast tempo
Less vibrant = Slow tempo
Contrast (how much the colors that are close to each other within a distance contrast each other)
RGB -> R, G, B -> X, Y, Z
Map each RGB value to a point in a 3-axis graph
sqrt((R1 - R2)^2 + (G1 - G2)^2 + (B1 - B2)^2))
More contrast = Synth and more energetic instruments
Less contrast = Orchestral instruments

Temperature (scale from warm to blue)
#FFFFFF
- Red: Wavy, low pitch
- Blue: high pitch

Roundness
More corners/sharp edges -> Punchier/shorter/staccato notes
Less contrast - harp (melody), bells (bass)
More contrast - synth (melody), piano (bass)
More round -> Smoother/Longer/Legato notes
Less contrast - flute (melody), sustain strings (bass)
More contrast - synth (melody), piano (bass)

Happiness
Machine Learning algorithm to detect Happiness in photos and give a percentage score 0-100% and if at or over 50%, there is happiness, and if under 50% there is not happiness
Happy = Major key
Sad = Minor key

Uniqueness
How well an object in an image fits given its surroundings
Machine Learning algorithm for images & Machine Learning algorithm for surroundings. Find similarity between the two images through formula (dot product, etc.)
See ranking above (for both major and minor)

Difference between Main Color (Color with most prominence in photo) and average color from each column
By looking at each pixel individually w/ something like nested for loop
Map each color to a note using HSV
Hue (0-360)
Saturation (0-100)
Value (0-100)
Give Saturation 25% of weight, Value 25% of weight, Hue 50% of weight and then give score 
Range of notes = max note - min note
Map each note to a range in the score
For example, if there are 14 notes and a score from 0-100, the first note would have the score values of 0-7 (100/14)
Score is input, note is output

Main Color distance from Red (255, 0, 0) using distance formula
The further the color is from red/closer to blue (0, 0, 255), the more “offbeat” the rhythm gets (notes not placed on the strong/stable beats)


Our main topic for images:
Mountains -> increases, more intense
Light pollution -> increases, gets faster



Main color distance from Red - Rhythm
Difference from main color as x increases - Melody (pitches of the notes)
Contrast - Instruments
Vibrancy - Tempo (speed)
Uniqueness - Key signature
Happiness - Major/minor key

https://svs.gsfc.nasa.gov/gallery/daily-visualizations/



