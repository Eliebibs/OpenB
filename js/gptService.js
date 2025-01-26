class GPTService {
    constructor() {
        this.API_KEY = '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'; // Replace with your actual API key
        this.API_URL = 'https://api.openai.com/v1/chat/completions';
    }

    async generateDrawingInstructions(prompt, dimensions) {
        const systemPrompt = `You are a drawing instruction generator for a digital whiteboard. The user wants to draw "${prompt}", their white board dimensions are width: ${dimensions.width}px, height: ${dimensions.height}px. Convert that request into a series of JSON objects, each describing a line.

Each line instruction must have the following format:

{
"type": "line",
"start_x": <number>,
"start_y": <number>,
"end_x": <number>,
"end_y": <number>,
"color": "black",
"width": 2
}

- "type" must always be "line".
- Coordinates (start_x, start_y, end_x, end_y) are integers.
- "color" defaults to "black".
- "width" defaults to 2.
- Return multiple line objects in a JSON array if needed to represent the full drawing.
- **Do not** include any additional keys or commentary—only the JSON.

**Single-line Example**:
[
{
"type": "line",
"start_x": 10,
"start_y": 20,
"end_x": 50,
"end_y": 20,
"color": "black",
"width": 2
}
]

**Multi-line Example** (e.g., simple shape or chart):
[
{
"type": "line",
"start_x": 50,
"start_y": 100,
"end_x": 150,
"end_y": 100,
"color": "black",
"width": 2
},
{
"type": "line",
"start_x": 150,
"start_y": 100,
"end_x": 150,
"end_y": 200,
"color": "black",
"width": 2
},
{
"type": "line",
"start_x": 150,
"start_y": 200,
"end_x": 50,
"end_y": 200,
"color": "black",
"width": 2
},
{
"type": "line",
"start_x": 50,
"start_y": 200,
"end_x": 50,
"end_y": 100,
"color": "black",
"width": 2
}
]

Now, based on the user's request, output **only** a JSON array of line objects. No additional text or explanation. CODE ONLY CODE ONLY`;

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating drawing instructions:', error);
            throw error;
        }
    }
} 