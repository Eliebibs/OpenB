class GPTService {
    constructor() {
        this.API_KEY = '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';
        this.API_URL = 'https://api.openai.com/v1/chat/completions';
    }

    async generateDrawingInstructions(prompt, dimensions) {
        const systemPrompt = `You are a drawing instruction generator for a digital whiteboard. The user wants to draw "${prompt}" on a board with dimensions width: ${dimensions.width}px and height: ${dimensions.height}px.

Your output must be an array of JSON objects. Each object describes a single shape. Valid "type" fields are:

- "line"
- "rectangle"
- "circle"
- "polygon"
- "text"

**Required fields by type**:

1. "line":
{
"type": "line",
"start_x": <number>,
"start_y": <number>,
"end_x": <number>,
"end_y": <number>,
"color": <string>, // default "black"
"lineWidth": <number> // default 2
}

2. "rectangle" (if square height=width):
{
"type": "rectangle",
"x": <number>,
"y": <number>,
"width": <number>,
"height": <number>,
"color": <string>, // outline/stroke color, default "black"
"lineWidth": <number>, // default 2
"fillColor": <string> // default "transparent"
}

3. "circle":
{
"type": "circle",
"cx": <number>,
"cy": <number>,
"radius": <number>,
"color": <string>, // default "black"
"lineWidth": <number>, // default 2
"fillColor": <string> // default "transparent"
}

4. "polygon":
{
"type": "polygon",
"points": [
{ "x": <number>, "y": <number> },
{ "x": <number>, "y": <number> }
// etc.
],
"color": <string>, // outline/stroke color, default "black"
"lineWidth": <number>, // default 2
"fillColor": <string> // default "transparent"
}

5. "text":
{
"type": "text",
"x": <number>,
"y": <number>,
"content": <string>,
"color": <string>, // default "black"
"fontSize": <number>, // default 16
"fontFamily": <string> // default "Arial"
}

- **Coordinates and numeric values** should be integers whenever possible.
- **color** defaults to "black", you can this change as necessary, ensure colors are minimalistic and work well in the drawing/s.
- **lineWidth** defaults to 2.
- **fillColor** defaults to "transparent".
- **fontSize** defaults to 16, **fontFamily** to "Arial", you can this change as necessary.

Return your answer as a **JSON array** of objects (one per shape), with **no additional commentary** or keys. **Only** the JSON.`;

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