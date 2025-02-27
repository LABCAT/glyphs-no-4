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
    if(p.audioLoaded && p.song.isPlaying() && p.glyphs && p.glyphs.length > 0){
        p.background(p.colourSet[0]);
        p.fill(0, 0, 0);
        p.rect(0, 0, p.width, p.height);
        p.drawGradientRectangle();
        
        // Draw and update all glyphs in the array
        p.glyphs.forEach(glyph => {
            // Special handling for grand finale glyph
            if (glyph.isGrandFinale) {
                // Create an expanding ripple effect
                p.push();
                if (!p.finaleRipples) {
                    p.finaleRipples = [];
                    // Initialize with 3 ripples at different sizes
                    for (let i = 0; i < 3; i++) {
                        p.finaleRipples.push({
                            size: glyph.radius * (0.5 + i * 0.25),
                            alpha: 255 - (i * 60),
                            growing: true
                        });
                    }
                }
                
                // Draw ripples
                p.noFill();
                p.finaleRipples.forEach(ripple => {
                    p.stroke(p.colourSet[p.frameCount % p.colourSet.length]);
                    p.strokeWeight(p.map(ripple.size, 0, glyph.radius * 3, 8, 1));
                    p.ellipse(glyph.x, glyph.y, ripple.size * 2);
                    
                    // Update ripple
                    if (ripple.growing) {
                        ripple.size += 5;
                        ripple.alpha -= 2;
                        if (ripple.size > glyph.radius * 3) {
                            ripple.size = glyph.radius * 0.2;
                            ripple.alpha = 255;
                        }
                    }
                });
                p.pop();
                
                // Create a dramatic color shift effect
                if (p.frameCount % 10 === 0) {
                    const prevColors = [...p.colourSet];
                    p.colourSet = p.generateColorSet();
                    // Morph between color sets
                    for (let i = 0; i < Math.min(prevColors.length, p.colourSet.length); i++) {
                        p.colourSet[i] = p.lerpColor(prevColors[i], p.colourSet[i], 0.2);
                    }
                }
            }
            
            // Normal drawing
            glyph.draw();
            glyph.update();
            
            // Additional effects for grand finale
            if (glyph.isGrandFinale) {
                // Draw connecting lines between random points on the glyph
                p.push();
                p.stroke(p.colourSet[p.frameCount % p.colourSet.length]);
                p.strokeWeight(1);
                for (let i = 0; i < 20; i++) {
                    const angle1 = p.random(p.TWO_PI);
                    const angle2 = p.random(p.TWO_PI);
                    const x1 = glyph.x + Math.cos(angle1) * glyph.radius * p.random(0.5, 1.0);
                    const y1 = glyph.y + Math.sin(angle1) * glyph.radius * p.random(0.5, 1.0);
                    const x2 = glyph.x + Math.cos(angle2) * glyph.radius * p.random(0.5, 1.0);
                    const y2 = glyph.y + Math.sin(angle2) * glyph.radius * p.random(0.5, 1.0);
                    p.line(x1, y1, x2, y2);
                }
                p.pop();
            }
        });
        
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
    
        // Calculate responsive dimensions
        // For smaller screens, use a smaller percentage of screen width for margin and stroke
        const minDimension = Math.min(p.width, p.height);
        const margin = minDimension * 0.05; // 5% of the smallest dimension
        const strokeWidth = minDimension * 0.025; // 2.5% of the smallest dimension
    
        // Set the gradient stroke using the 2D canvas context directly
        ctx.strokeStyle = gradient;
        ctx.lineWidth = strokeWidth;
    
        // Draw the full-screen rectangle with the animated gradient stroke
        p.noFill();
        p.rect(margin, margin, p.width - (margin * 2), p.height - (margin * 2));
    
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
            
            // Store the total number of notes in the track
            p.totalTrackNotes = track1.length;
            
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
        console.log(currentCue);
        
        // Check if this is the very last cue in the entire track
        const isVeryLastCue = currentCue === p.totalTrackNotes;
        
        if(isVeryLastCue) {
            // This is the very last glyph in the entire track - make it special!
            p.glyphs = []; // Clear existing glyphs
            
            // Create a special grand finale glyph
            const finalGlyph = new LABCATGlyph(
                p,
                p.width / 2,
                p.height / 2,
                p.height / 1.5, // Make it super large - almost filling the canvas
                true // Set shouldGrow to true
            );
            
            // Set special properties for the grand finale glyph
            finalGlyph.isGrandFinale = true;
            
            p.glyphs = [finalGlyph];
            p.glyph = finalGlyph; // Keep reference for backward compatibility
        }
        else if(!p.glyph || currentCue % 66 === 1) {
            // Reset at the beginning of a cycle
            p.colourSet = p.generateColorSet();
            p.glyphs = []; // Create an array to hold multiple glyphs
            
            // Create first glyph (main one, slightly larger)
            const firstGlyph = new LABCATGlyph(
                p,
                p.width / 2,
                p.height / 2,
                p.random(p.height / 8 * 3, p.height / 8 * 7)
            );
            p.glyphs.push(firstGlyph);
            p.glyph = firstGlyph; // Keep reference for backward compatibility
        }
        else {
            // Check if this is one of the last 5 cues in the 66-cue cycle
            const cyclePosition = currentCue % 66;
            const isLastFiveCues = cyclePosition >= 60 && cyclePosition < 66;
            
            if (isLastFiveCues) {
                // For the last 5 cues, create a single growing glyph
                p.glyphs = []; // Clear existing glyphs
                const growingGlyph = new LABCATGlyph(
                    p,
                    p.width / 2,
                    p.height / 2,
                    p.random(p.height / 8 * 3, p.height / 8 * 7),
                    true // Set shouldGrow to true
                );
                p.glyphs.push(growingGlyph);
                p.glyph = growingGlyph; // Keep reference for backward compatibility
            } else {
                // For all other cues, implement circle packing with 1-5 glyphs of varying sizes
                
                // First, randomly decide if we should add a new glyph (if under max)
                if (p.glyphs.length < 5 && p.random() > 0.7) { // 30% chance to add new glyph
                    // Try to place a new glyph with circle packing (non-overlapping)
                    const newGlyph = p.createPackedGlyph();
                    if (newGlyph) {
                        p.glyphs.push(newGlyph);
                    }
                }
                
                // Randomly decide if we should remove a glyph (if above min)
                if (p.glyphs.length > 1 && p.random() > 0.8) { // 20% chance to remove a glyph
                    // Remove a random glyph, but not the main one (index 0)
                    if (p.glyphs.length > 1) {
                        const indexToRemove = Math.floor(p.random(1, p.glyphs.length));
                        p.glyphs.splice(indexToRemove, 1);
                    }
                }
                
                // Change colors of all existing glyphs
                p.glyphs.forEach(glyph => glyph.nextColour());
                
                // Update the main glyph reference for backward compatibility
                p.glyph = p.glyphs[0];
            }
        }
    }
    
    // New helper function to create a non-overlapping glyph with varied sizes
    p.createPackedGlyph = () => {
        const MAX_ATTEMPTS = 50;
        let attempts = 0;
        
        // Try to find a valid position
        while (attempts < MAX_ATTEMPTS) {
            // Generate random position within canvas bounds
            const x = p.random(p.width * 0.2, p.width * 0.8);
            const y = p.random(p.height * 0.2, p.height * 0.8);
            
            // Create varied size for glyphs
            // Main glyph (index 0) is already larger, make these smaller with variation
            const sizeVariation = p.random(0.3, 0.8); // 30% to 80% of the normal size
            const radius = p.random(p.height / 10, p.height / 5) * sizeVariation;
            
            // Check if this position overlaps with existing glyphs
            let overlaps = false;
            for (const glyph of p.glyphs) {
                const distance = p.dist(x, y, glyph.x, glyph.y);
                const minDistance = radius + glyph.radius + 20; // Add padding
                if (distance < minDistance) {
                    overlaps = true;
                    break;
                }
            }
            
            // If no overlap, create and return the new glyph
            if (!overlaps) {
                return new LABCATGlyph(p, x, y, radius);
            }
            
            attempts++;
        }
        
        // Could not place a new glyph after max attempts
        return null;
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