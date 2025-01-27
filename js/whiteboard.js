class Whiteboard {
    constructor(canvasId) {
        // Initialize canvas and context
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Drawing state
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        
        // Store drawn shapes
        this.shapes = [];
        
        // Bind methods to this instance
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        
        // Add dimensions tracking
        this.dimensions = {
            width: 0,
            height: 0
        };
        
        // Initialize the whiteboard
        this.init();

        // Log the initial dimensions
        this.logWhiteboardInfo();
    }

    init() {
        // Set canvas size to match window size (minus some padding)
        this.resize();
        
        // Add event listeners
        this.addEventListeners();
        
        // Set initial canvas styles
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
    }

    resize() {
        // Update canvas size
        this.canvas.width = window.innerWidth - 50;
        this.canvas.height = window.innerHeight - 50;
        
        // Store dimensions
        this.dimensions = {
            width: this.canvas.width,
            height: this.canvas.height
        };

        // Log updated dimensions
        this.logWhiteboardInfo();
    }

    addEventListeners() {
        // Add mouse event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        
        // Add resize listener
        window.addEventListener('resize', () => this.resize());
    }

    handleMouseDown(e) {
        this.isDrawing = true;
        
        // Get the starting coordinates
        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
    }

    handleMouseMove(e) {
        if (!this.isDrawing) return;

        // Get current mouse position
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        // Clear the canvas and redraw all previous shapes
        this.redrawShapes();

        // Draw the current shape preview
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
    }

    handleMouseUp(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        // Create shape object with additional context
        const shape = {
            type: 'line',
            start_x: this.startX,
            start_y: this.startY,
            end_x: endX,
            end_y: endY,
            color: 'black',
            width: 2,
            whiteboard_dimensions: this.dimensions // Include dimensions with each shape
        };

        this.shapes.push(shape);
        console.log('Drawing Instruction:', JSON.stringify(shape, null, 2));

        this.isDrawing = false;
    }

    redrawShapes() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Redraw all stored shapes
        this.shapes.forEach(shape => {
            // Set common properties
            this.ctx.strokeStyle = shape.color || 'black';
            this.ctx.lineWidth = shape.width || 2;
            this.ctx.fillStyle = shape.fillColor || 'transparent';

            switch (shape.type) {
                case 'line':
                    this.drawLine(shape);
                    break;
                case 'rectangle':
                    this.drawRectangle(shape);
                    break;
                case 'circle':
                    this.drawCircle(shape);
                    break;
                case 'polygon':
                    this.drawPolygon(shape);
                    break;
                case 'text':
                    this.drawText(shape);
                    break;
            }
        });
    }

    // Individual shape drawing methods
    drawLine(shape) {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.start_x, shape.start_y);
        this.ctx.lineTo(shape.end_x, shape.end_y);
        this.ctx.stroke();
    }

    drawRectangle(shape) {
        if (shape.fillColor) {
            this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        }
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }

    drawCircle(shape) {
        this.ctx.beginPath();
        this.ctx.arc(shape.cx, shape.cy, shape.radius, 0, 2 * Math.PI);
        if (shape.fillColor) {
            this.ctx.fill();
        }
        this.ctx.stroke();
    }

    drawPolygon(shape) {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
        shape.points.slice(1).forEach(point => {
            this.ctx.lineTo(point.x, point.y);
        });
        this.ctx.closePath();
        if (shape.fillColor) {
            this.ctx.fill();
        }
        this.ctx.stroke();
    }

    drawText(shape) {
        this.ctx.font = `${shape.fontSize || 16}px ${shape.fontFamily || 'Arial'}`;
        this.ctx.fillStyle = shape.color || 'black';
        this.ctx.fillText(shape.content, shape.x, shape.y);
    }

    logWhiteboardInfo() {
        console.log('Whiteboard Information:', JSON.stringify({
            type: 'whiteboard_info',
            dimensions: this.dimensions,
            timestamp: new Date().toISOString()
        }, null, 2));
    }

    drawFromInstructions(instructions) {
        try {
            // Parse the JSON string if it's not already an object
            const shapeInstructions = typeof instructions === 'string' 
                ? JSON.parse(instructions) 
                : instructions;

            // Validate that we have an array of instructions
            if (!Array.isArray(shapeInstructions)) {
                throw new Error('Drawing instructions must be an array');
            }

            // Add each shape to our shapes array
            shapeInstructions.forEach(shape => {
                // Validate the shape has a valid type
                if (!['line', 'rectangle', 'circle', 'polygon', 'text'].includes(shape.type)) {
                    throw new Error(`Invalid shape type: ${shape.type}`);
                }

                // Validate required fields based on shape type
                this.validateShape(shape);

                // Add shape to our array
                this.shapes.push(shape);
            });

            // Redraw all shapes
            this.redrawShapes();
            
            return true;
        } catch (error) {
            console.error('Error drawing instructions:', error);
            return false;
        }
    }

    validateShape(shape) {
        switch (shape.type) {
            case 'line':
                if (typeof shape.start_x !== 'number' || 
                    typeof shape.start_y !== 'number' ||
                    typeof shape.end_x !== 'number' ||
                    typeof shape.end_y !== 'number') {
                    throw new Error('Invalid line coordinates');
                }
                break;

            case 'rectangle':
                if (typeof shape.x !== 'number' ||
                    typeof shape.y !== 'number' ||
                    typeof shape.width !== 'number' ||
                    typeof shape.height !== 'number') {
                    throw new Error('Invalid rectangle parameters');
                }
                break;

            case 'circle':
                if (typeof shape.cx !== 'number' ||
                    typeof shape.cy !== 'number' ||
                    typeof shape.radius !== 'number') {
                    throw new Error('Invalid circle parameters');
                }
                break;

            case 'polygon':
                if (!Array.isArray(shape.points) || 
                    shape.points.length < 3 ||
                    !shape.points.every(p => typeof p.x === 'number' && typeof p.y === 'number')) {
                    throw new Error('Invalid polygon points');
                }
                break;

            case 'text':
                if (typeof shape.x !== 'number' ||
                    typeof shape.y !== 'number' ||
                    typeof shape.content !== 'string') {
                    throw new Error('Invalid text parameters');
                }
                break;
        }
    }
}
