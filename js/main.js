// Initialize the whiteboard when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize services
    const whiteboard = new Whiteboard('whiteboard');
    const gptService = new GPTService();

    // Get UI elements
    const drawingInput = document.getElementById('drawing-input');
    const sendButton = document.getElementById('send-button');

    // Handle send button click
    sendButton.addEventListener('click', async () => {
        const prompt = drawingInput.value.trim();
        if (!prompt) return;

        // Show loading state
        sendButton.classList.add('loading');

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
                console.error('Failed to draw instructions');
                // Optionally add user feedback here
            }

            // Clear the input after successful drawing
            drawingInput.value = '';

        } catch (error) {
            console.error('Error:', error);
            // Optionally add user feedback here
        } finally {
            // Hide loading state
            sendButton.classList.remove('loading');
        }
    });

    // Handle enter key in input
    drawingInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
});
