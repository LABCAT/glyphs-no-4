export default class LABCATGlyph {
    constructor(p5, x, y, width, shouldGrow = false, isFinalGlyph = false) {
        this.p = p5;
        this.x = x;
        this.y = y;
        this.rotation = this.p.random(0, 360);
        
        // Simple growth flag
        this.shouldGrow = shouldGrow;
        this.width = shouldGrow ? 0 : width; // Start at 0 if growing
        
        // New parameter for final glyph
        this.isFinalGlyph = isFinalGlyph;
        
        // Special properties for final glyph
        if (this.isFinalGlyph) {
            this.pulseAmount = 0;
            this.pulseDirection = 1;
            this.colorPhase = 0;
            this.starRotation = 0;
        }
        
        this.nextColour();
    }

    nextColour() {
        // the HSB colour that this Glyph represents
        const randomColour = this.p.random(this.p.colourSet);
        this.hsbColour = [
            this.p.hue(randomColour),       
            this.p.saturation(randomColour),
            this.p.brightness(randomColour)  
        ];
       
        // value of the hue dimension
        this.hueDegree = this.hsbColour[0];
        this.brightnessTrans = this.p.map(this.hsbColour[2], 0, 100, 0.8, 0);
        this.hueTrans = this.p.map(this.hsbColour[2], 100, 0, 0.9, 0.1);
        this.center = this.width / 2;
        this.opacityMultiplier = 0;
        this.rotation = this.p.random(0, 360);
        this.update();
    }

    update() {
        // Increase width if growing
        if (this.shouldGrow) {
            this.width += 32; // Faster growth as requested
            
            // Check if we need to initialize rotation direction
            if (!this.rotationDirection) {
                // Randomly choose between 1 (clockwise) and -1 (counterclockwise)
                this.rotationDirection = this.p.random([-1, 1]);
            }
            
            // Apply rotation in the chosen direction
            this.rotation += 1 * this.rotationDirection;
        }
        
        // Special final glyph animations
        if (this.isFinalGlyph) {
            // Pulsating effect
            this.pulseAmount += 0.02 * this.pulseDirection;
            if (this.pulseAmount > 1 || this.pulseAmount < 0) {
                this.pulseDirection *= -1;
            }
            
            // Rotating star effect
            this.starRotation += 0.5;
            
            // Shifting color phase
            this.colorPhase += 1;
            
            // Faster rotation
            this.rotation += 0.5 * this.rotationDirection;
        }
        
        this.opacityMultiplier = this.opacityMultiplier >= 1 ? 1 : this.opacityMultiplier + 0.05;

        this.center = this.width / 2;

        // variables created by the saturation dimension
        this.circleSize = this.p.map(this.hsbColour[1], 100, 0, this.width, 0 + this.width/16);

        // JSON object containing the different values for the three circles drawn to represent the saturation dimension
        this.satCircles = {
            'brightness' : [
                100,
                0,
                100
            ],
            'alpha' : [
                0.1875,
                0.625,
                0.375
            ],
            'size' : [
                this.circleSize,
                this.circleSize/2,
                this.circleSize/4,
            ]
        }

        // For final glyph, enhance saturation circles
        if (this.isFinalGlyph) {
            this.satCircles.alpha = [
                0.6 + (this.pulseAmount * 0.3),
                0.8 - (this.pulseAmount * 0.3),
                0.7
            ];
        }

        // horiVertMin and horiVertMax are values that determine the positions for the alternating points (between the center of a circle and its edge)
        // of the vertical and horizontal triangles used to represent the hue dimension
        this.horiVertMin = this.p.map(this.hueDegree, 0, 179, this.center, 0);
        this.horiVertMax = this.p.map(this.hueDegree, 0, 179, this.center, this.width);
        if(this.hueDegree > 179) {
            this.horiVertMin = 0;
            this.horiVertMax = this.width;
        }

        // diagonalMin and diagonalMax are values that determine the position for the alternating points (between the center of a circle and its edge)
        // of the diagonal triangles representing the hue dimension
        this.diagonalMin = this.p.map(this.hueDegree, 359, 180, (0 + this.width/8 + this.width/32), this.center);
        this.diagonalMax = this.p.map(this.hueDegree, 359, 180, (this.width - this.width/8 - this.width/32), this.center);

        // For final glyph, enhance the shape by extending the triangles
        if (this.isFinalGlyph) {
            const extendFactor = 1.2 + (this.pulseAmount * 0.2);
            this.horiVertMax *= extendFactor;
            this.diagonalMax *= extendFactor;
        }

        // set up the JSON objects used to store all the x and y positions of the triangles that will be drawn when this is passed to the drawStar function
        this.positions = {
            'x1': [
                this.center - this.width/32,
                this.center - this.width/32,
                this.center,
                this.center + this.width/32,
                this.center - this.width/32,
                this.center - this.width/32,
                this.center,
                this.center + this.width/32,
            ],
            'y1': [
                this.center,
                this.center - this.width/32,
                this.center - this.width/32,
                this.center - this.width/32,
                this.center,
                this.center - this.width/32,
                this.center - this.width/32,
                this.center - this.width/32
            ],
            'x2': [
                this.center,
                this.diagonalMax,
                this.horiVertMax,
                this.diagonalMax,
                this.center,
                this.diagonalMin,
                this.horiVertMin,
                this.diagonalMin
            ],
            'y2': [
                this.horiVertMin,
                this.diagonalMin,
                this.center,
                this.diagonalMax,
                this.horiVertMax,
                this.diagonalMax,
                this.center,
                this.diagonalMin
            ],
            'x3': [
                this.center + this.width/32,
                this.center + this.width/32,
                this.center,
                this.center - this.width/32,
                this.center + this.width/32,
                this.center + this.width/32,
                this.center,
                this.center - this.width/32
            ],
            'y3': [
                this.center,
                this.center + this.width/32,
                this.center + this.width/32,
                this.center + this.width/32,
                this.center,
                this.center + this.width/32,
                this.center + this.width/32,
                this.center + this.width/32
            ]
        }
    }

    draw() {
        // Skip drawing if width is too small
        if (this.width < 1) return;
        
        this.p.push();
        
        this.p.translate(this.x, this.y);
        this.p.rotate(this.rotation);
        this.p.translate(-this.width / 2, -this.width / 2);
        
        // Special effects for final glyph
        if (this.isFinalGlyph) {
            // Draw multiple layers of stars with different rotations for the final glyph
            const numLayers = 3;
            for (let layer = 0; layer < numLayers; layer++) {
                this.p.push();
                
                // Vary rotation for each layer
                const layerRotation = (this.starRotation * (layer + 1) * 0.5) % 360;
                
                this.p.translate(this.center, this.center);
                this.p.rotate(layerRotation);
                this.p.translate(-this.center, -this.center);
                
                // Use cycling colors from the color set
                const colorIndex = (Math.floor(this.colorPhase / 10) + layer) % this.p.colourSet.length;
                const layerColor = this.p.colourSet[colorIndex];
                
                // Draw extra triangles for a more complex shape
                const layerScale = 1 + (layer * 0.3);
                this.p.noStroke();
                this.p.fill(
                    this.p.hue(layerColor),
                    this.p.saturation(layerColor),
                    this.p.brightness(layerColor),
                    0.3
                );
                
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * this.p.TWO_PI;
                    const distance = this.width / 3 * layerScale;
                    const x1 = this.center;
                    const y1 = this.center;
                    const x2 = this.center + Math.cos(angle) * distance;
                    const y2 = this.center + Math.sin(angle) * distance;
                    const x3 = this.center + Math.cos(angle + this.p.PI/8) * distance;
                    const y3 = this.center + Math.sin(angle + this.p.PI/8) * distance;
                    
                    this.p.triangle(x1, y1, x2, y2, x3, y3);
                }
                
                this.p.pop();
            }
        }
            
        // draw the circles that represent the saturation dimension
        this.p.stroke(0);
        for(var i = 0; i < 3; i++){
            // For final glyph, use more vibrant colors for circles
            if (this.isFinalGlyph) {
                const colorIndex = (Math.floor(this.colorPhase / 15) + i) % this.p.colourSet.length;
                const circleColor = this.p.colourSet[colorIndex];
                
                this.p.fill(
                    this.p.hue(circleColor),
                    this.p.saturation(circleColor),
                    this.p.brightness(circleColor),
                    this.satCircles['alpha'][i] * this.opacityMultiplier
                );
            } else {
                this.p.fill(
                    0, 
                    0, 
                    this.satCircles['brightness'][i], 
                    this.satCircles['alpha'][i] * this.opacityMultiplier
                );
            }
            this.p.ellipse(this.center, this.center, this.satCircles['size'][i]);
        }

        // draw the octagon
        if (this.isFinalGlyph) {
            // Use shifting colors for the octagon
            const octagonColorIndex = Math.floor(this.colorPhase / 20) % this.p.colourSet.length;
            const octagonColor = this.p.colourSet[octagonColorIndex];
            
            this.p.fill(
                this.p.hue(octagonColor),
                this.p.saturation(octagonColor),
                this.p.brightness(octagonColor),
                (0.7 + this.pulseAmount * 0.3) * this.opacityMultiplier
            );
        } else {
            this.p.fill(
                this.hueDegree, 
                100, 
                100, 
                this.brightnessTrans * this.opacityMultiplier
            );
        }
        this.p.octagon(this.center, this.center, this.width / 3);

        //draw the stars that represent the hue dimension
        this.p.noStroke();
        this.p.angleMode(this.p.DEGREES);
        this.p.translate(this.center, this.center);
        
        // For final glyph, create more complex star rotation
        if (this.isFinalGlyph) {
            this.p.rotate(this.hueDegree + this.starRotation);
        } else {
            this.p.rotate(this.hueDegree);
        }

        const hsba = this.isFinalGlyph
            ? Array(this.hueDegree, 100, 100, (0.8 + this.pulseAmount * 0.2) * this.opacityMultiplier)
            : Array(this.hueDegree, 100, 100, this.hueTrans * this.opacityMultiplier);
        
        this.star(hsba, this.positions, this.isFinalGlyph ? 2 : 3);
        
        this.p.rotate(-(this.isFinalGlyph ? this.hueDegree + this.starRotation : this.hueDegree));
        this.p.translate(-this.center, -this.center);
        
        const whiteStarHsba = this.isFinalGlyph
            ? Array(0, 0, 100, (0.9 + this.pulseAmount * 0.1) * this.opacityMultiplier)
            : Array(0, 0, 100, 0.8 * this.opacityMultiplier);
        
        this.star(whiteStarHsba, this.positions);
        
        // For final glyph, add an extra outer glow effect
        if (this.isFinalGlyph) {
            this.p.noFill();
            for (let i = 0; i < 5; i++) {
                const glowColorIndex = (Math.floor(this.colorPhase / 10) + i) % this.p.colourSet.length;
                const glowColor = this.p.colourSet[glowColorIndex];
                
                this.p.stroke(
                    this.p.hue(glowColor),
                    this.p.saturation(glowColor),
                    this.p.brightness(glowColor),
                    0.2 - (i * 0.04)
                );
                this.p.strokeWeight(2);
                
                const glowSize = this.width * (1 + (i * 0.1)) * (1 + this.pulseAmount * 0.1);
                this.p.ellipse(this.center, this.center, glowSize);
            }
        }
        
        this.p.pop();
    }

    /**
     * function to draw the 8 triangles that repressnt the hue dimension 
     * the colour and transparency level of the triangles is also affected by the brightness dimension
     * @param {Array}  hsba       		- Array of values used to set the values for the fill function
     * @param {Object} positions    	- Object containing all the x and y positions of the 8 triangles that make up the star
     * @param {Number} sizeReducer   	- Variable that allows the star to drawn at smaller size, should be greater than 1  
     */
    star(hsba, positions, sizeReducer = 1) {
        this.p.fill(hsba[0], hsba[1], hsba[2], hsba[3]);
        for(let i = 0; i < 8; i++){
            this.p.triangle(
                positions['x1'][i]/sizeReducer, 
                positions['y1'][i]/sizeReducer, 
                positions['x2'][i]/sizeReducer, 
                positions['y2'][i]/sizeReducer, 
                positions['x3'][i]/sizeReducer, 
                positions['y3'][i]/sizeReducer
            );
        }
    }
}