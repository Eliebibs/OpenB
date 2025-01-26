class Whiteboard {
    constructor(canvasId) {
        // Initialize canvas and context
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Drawing state
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        
        // Store drawn lines
        this.lines = [];
        
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
        this.canvas.width = window.innerWidth - 40;
        this.canvas.height = window.innerHeight - 40;
        
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

        // Clear the canvas and redraw all previous lines
        this.redrawLines();

        // Draw the current line preview
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

        // Create line object with additional context
        const line = {
            type: 'line',
            start_x: this.startX,
            start_y: this.startY,
            end_x: endX,
            end_y: endY,
            color: 'black',
            width: 2,
            whiteboard_dimensions: this.dimensions // Include dimensions with each line
        };

        this.lines.push(line);
        console.log('Drawing Instruction:', JSON.stringify(line, null, 2));

        this.isDrawing = false;
    }

    redrawLines() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Redraw all stored lines
        this.lines.forEach(line => {
            this.ctx.beginPath();
            this.ctx.moveTo(line.start_x, line.start_y);
            this.ctx.lineTo(line.end_x, line.end_y);
            this.ctx.stroke();
        });
    }

    logWhiteboardInfo() {
        console.log('Whiteboard Information:', JSON.stringify({
            type: 'whiteboard_info',
            dimensions: this.dimensions,
            timestamp: new Date().toISOString()
        }, null, 2));
    }
}
