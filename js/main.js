// Initialize the whiteboard when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize services
    const whiteboard = new Whiteboard('whiteboard');
    const gptService = new GPTService();

    // Get UI elements
    const drawingInput = document.getElementById('drawing-input');
    const sendButton = document.getElementById('send-button');
    const errorMessage = document.getElementById('error-message');
    const explanationContent = document.getElementById('explanation-content');
    const currentSummaryElement = document.getElementById('current-summary');

    // Initialize state
    let currentSummary = "";

    // Function to show error message
    const showError = (message) => {
        console.error('Error:', message);
        errorMessage.textContent = message;
        errorMessage.classList.add('visible');
        setTimeout(() => {
            errorMessage.classList.remove('visible');
        }, 3000);
    };

    // Handle send button click
    sendButton.addEventListener('click', async () => {
        const prompt = drawingInput.value.trim();
        if (!prompt) return;

        // Show loading state
        sendButton.classList.add('loading');
        drawingInput.disabled = true;

        try {
            console.log('Sending prompt:', prompt);
            console.log('Current summary:', currentSummary);
            console.log('Current shapes:', whiteboard.shapes);

            // Get response from GPT
            const response = await gptService.generateMultiStepResponse(
                prompt, 
                whiteboard.dimensions,
                currentSummary,
                whiteboard.shapes
            );

            console.log('GPT Response:', response);

            // Update the explanation panel
            explanationContent.textContent = response.explanation;

            // Draw the new shapes
            const success = whiteboard.drawFromInstructions(response.drawing);
            
            if (!success) {
                throw new Error('Failed to draw instructions');
            }

            // Update the summary
            currentSummary = response.summary;
            currentSummaryElement.textContent = currentSummary;

            // Clear the input after successful drawing
            drawingInput.value = '';

        } catch (error) {
            console.error('Detailed error:', error);
            showError(error.message || 'Error generating drawing instructions');
        } finally {
            // Reset UI state
            sendButton.classList.remove('loading');
            drawingInput.disabled = false;
        }
    });

    // Handle clear button
    const clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', () => {
        whiteboard.shapes = [];
        whiteboard.redrawShapes();
        currentSummary = "";
        explanationContent.textContent = "";
        currentSummaryElement.textContent = "";
        console.log('Board and summary cleared');
    });

    // Handle enter key in input
    drawingInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });
});
