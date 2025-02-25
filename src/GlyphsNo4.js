import { Midi } from '@tonejs/midi';
import LABCATGlyph from './classes/LABCATGlyph';

/** 
 * Add your ogg and mid files in the audio director and update these file names
 */
const audio = new URL("@audio/glyphs-no-4.ogg", import.meta.url).href;
const midi = new URL("@audio/glyphs-no-4.mid", import.meta.url).href;

const GlyphsNo4 = (p) => {
    /** 
     * Core audio properties
     */
    p.song = null;
    p.audioLoaded = false;
    p.songHasFinished = false;

    /** 
     * Preload function - Loading audio and setting up MIDI
     * This runs first, before setup()
     */
    p.preload = () => {
        /** 
         * Log when preload starts
         */
        p.song = p.loadSound(audio, p.loadMidi);
        p.song.onended(() => p.songHasFinished = true);
    };

    p.glyph = null;

    /** 
     * Setup function - Initialize your canvas and any starting properties
     * This runs once after preload
     */
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.colorMode(p.HSB);
        p.colourSet = p.generateColorSet();
        p.background(p.colourSet[0]);
    };

    /** 
     * Main draw loop - This is where your animations happen
     * This runs continuously after setup
     */
    p.draw = () => {
        if(p.audioLoaded && p.song.isPlaying() && p.glyph){
            p.background(p.colourSet[0]);
            p.fill(0, 0, 0);
            p.rect(0, 0, p.width, p.height);
            p.drawGradientRectangle();
            p.glyph.draw();
            p.glyph.update();
            p.bgOpacity = p.bgOpacity + 0.01;
        }
    }

    p.drawGradientRectangle = () => {
        const ctx = p.drawingContext;

        // Create a rotating angle based on frame count
        const angle = p.frameCount * 0.01; // Adjust speed of rotation

        // Create a conic gradient
        const gradient = ctx.createConicGradient(angle, p.width / 2, p.height / 2);

        // Add color stops to the gradient
        for (let i = 0; i < 16; i++) {
            const colorIndex = i % p.colourSet.length; // Use modulo to loop through the colourSet
            const color = p.colourSet[colorIndex];
            const p5Color = p.color(color); // Convert the color to a p5.Color object
            gradient.addColorStop(i / 16, p5Color.toString()); // Use the string format of the color
        }

        // Save the original stroke settings
        const originalStrokeStyle = ctx.strokeStyle;
        const originalLineWidth = ctx.lineWidth;

        // Set the gradient stroke using the 2D canvas context directly
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 40; // Adjust the thickness as needed

        // Draw the full-screen rectangle with the animated gradient stroke
        p.noFill();
        p.rect(40, 40, p.width - 80, p.height - 80);

        // Reset the stroke settings to avoid affecting other parts
        ctx.strokeStyle = originalStrokeStyle;
        ctx.lineWidth = originalLineWidth;
    };



    /** 
     * MIDI loading and processing
     * Handles synchronization between audio and visuals
     */
    p.loadMidi = () => {
        Midi.fromUrl(midi).then((result) => {
            /** 
             * Log when MIDI is loaded
             */
            console.log('MIDI loaded:', result);
            /** 
             * Example: Schedule different tracks for different visual elements
             */
            const track1 = result.tracks[4].notes; // NN-XT - Dream Piano
            p.scheduleCueSet(track1, 'executeTrack1');
            /** 
             * Update UI elements when loaded
             */
            document.getElementById("loader").classList.add("loading--complete");
            document.getElementById('play-icon').classList.add('fade-in');
            p.audioLoaded = true;
        });
    };

    /** 
     * Schedule MIDI cues to trigger animations
     * @param {Array} noteSet - Array of MIDI notes
     * @param {String} callbackName - Name of the callback function to execute
     * @param {Boolean} polyMode - Allow multiple notes at same time if true
     */
    p.scheduleCueSet = (noteSet, callbackName, polyMode = false) => {
        let lastTicks = -1,
            currentCue = 1;
        for (let i = 0; i < noteSet.length; i++) {
            const note = noteSet[i],
                { ticks, time } = note;
            if(ticks !== lastTicks || polyMode){
                note.currentCue = currentCue;
                p.song.addCue(time, p[callbackName], note);
                lastTicks = ticks;
                currentCue++;
            }
        }
    }

    p.executeTrack1 = ({currentCue}) => {
        if(!p.glyph || currentCue % 66 === 1) {
            p.colourSet = p.generateColorSet();
            p.glyph = new LABCATGlyph(
                p, 
                p.width / 2, 
                p.height / 2, 
                p.random(p.height / 8 * 3, p.height / 8 * 7)
            );
        }
        else {
            p.glyph.nextColour();
        }
    }

    p.generateColorSet = (count = 6) => {
        const baseHue = Math.floor(Math.random() * 360);
        const colors = [];

        for (let i = 0; i < count; i++) {
            // Use large variations in hue for psychedelic effects
            const hue = (baseHue + (Math.random() * 360)) % 360;
            
            // Saturation between 80-100 for very bold and saturated colors
            const saturation = Math.floor(Math.random() * 20) + 80;

            // Brightness between 50-90 for a mix of bright and vibrant tones
            const brightness = Math.floor(Math.random() * 40) + 50;
            
            // Push HSB color into the set
            colors.push(p.color(hue, saturation, brightness));
        }

        return colors;
    }


    /** 
     * Handle mouse/touch interaction
     * Controls play/pause and reset functionality
     */
    p.mousePressed = () => {
        if(p.audioLoaded){
            if (p.song.isPlaying()) {
                p.song.pause();
            } else {
                if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                    /** 
                     * Reset animation properties here
                     */
                }
                document.getElementById("play-icon").classList.remove("fade-in");
                p.song.play();
            }
        }
    }
};

export default GlyphsNo4;