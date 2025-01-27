// Initialize the whiteboard when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize services
    const whiteboard = new Whiteboard('whiteboard');
    const gptService = new GPTService();

    // Get UI elements
    const drawingInput = document.getElementById('drawing-input');
    const sendButton = document.getElementById('send-button');
    const errorMessage = document.getElementById('error-message');

    // Function to show error message
    const showError = (message) => {
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
            // Get drawing instructions from GPT
            const instructions = await gptService.generateDrawingInstructions(
                prompt, 
                whiteboard.dimensions
            );

            // Log the instructions to console for debugging
            console.log('GPT Drawing Instructions:', instructions);

            // Draw the instructions on the whiteboard
            const success = whiteboard.drawFromInstructions(instructions);
            
            if (!success) {
                showError('Failed to draw instructions');
            } else {
                // Clear the input after successful drawing
                drawingInput.value = '';
            }

        } catch (error) {
            console.error('Error:', error);
            showError('Error generating drawing instructions');
        } finally {
            // Reset UI state
            sendButton.classList.remove('loading');
            drawingInput.disabled = false;
        }
    });

    // Handle enter key in input
    drawingInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });
});
