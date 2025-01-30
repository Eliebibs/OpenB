class GPTService {
    constructor() {
        this.API_KEY = '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';
        this.API_URL = 'https://api.openai.com/v1/chat/completions';
    }

    async generateMultiStepResponse(userQuestion, dimensions, currentSummary = "", existingShapes = []) {
        const systemPrompt = `You are a step-by-step teaching assistant for a digital whiteboard. 
Each time the user asks a question, you will provide three components in a single JSON response:
1. An explanation that teaches the concept
2. Drawing instructions to visualize the concept
3. An updated summary of everything taught so far

Your response must be a single JSON object with exactly these three fields:
{
    "explanation": "Clear, concise explanation of the current concept",
    "drawing": [
        {
            // Array of shape objects following the formats below
        }
    ],
    "summary": "Brief summary of all concepts covered, including this one"
}

Shape formats must be one of:
1. Line:
{
    "type": "line",
    "start_x": <number>,
    "start_y": <number>,
    "end_x": <number>,
    "end_y": <number>,
    "color": <string>,
    "lineWidth": <number>
}

2. Rectangle:
{
    "type": "rectangle",
    "x": <number>,
    "y": <number>,
    "width": <number>,
    "height": <number>,
    "color": <string>,
    "lineWidth": <number>,
    "fillColor": <string>
}

3. Circle:
{
    "type": "circle",
    "cx": <number>,
    "cy": <number>,
    "radius": <number>,
    "color": <string>,
    "lineWidth": <number>,
    "fillColor": <string>
}

4. Text:
{
    "type": "text",
    "x": <number>,
    "y": <number>,
    "content": <string>,
    "color": <string>,
    "fontSize": <number>,
    "fontFamily": <string>
}

Example response:
{
    "explanation": "A supply curve shows how quantity supplied changes with price. As price increases, suppliers are willing to produce more.",
    "drawing": [
        {
            "type": "line",
            "start_x": 50,
            "start_y": 400,
            "end_x": 350,
            "end_y": 100,
            "color": "blue",
            "lineWidth": 2
        },
        {
            "type": "text",
            "x": 200,
            "y": 50,
            "content": "Supply Curve",
            "color": "black",
            "fontSize": 16,
            "fontFamily": "Arial"
        }
    ],
    "summary": "Key concepts covered:\\n- Supply curve basics\\n- Positive relationship between price and quantity supplied"
}

Current board state:
${JSON.stringify(existingShapes, null, 2)}

Previous summary:
${currentSummary}

Return only valid JSON matching the format above. No additional text or explanation outside the JSON object.`;

        try {
            console.log('Sending request to GPT with prompt:', userQuestion);
            
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
                        { role: 'user', content: userQuestion }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('GPT API Error:', data);
                throw new Error(`API error: ${data.error?.message || 'Unknown error'}`);
            }

            // Log token usage
            if (data.usage) {
                console.log('Token usage:', {
                    prompt_tokens: data.usage.prompt_tokens,
                    completion_tokens: data.usage.completion_tokens,
                    total_tokens: data.usage.total_tokens
                });
            }

            const content = data.choices[0].message.content;
            
            // Validate JSON structure
            try {
                const parsed = JSON.parse(content);
                if (!parsed.explanation || !parsed.drawing || !parsed.summary) {
                    throw new Error('Missing required fields in GPT response');
                }
                return parsed;
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Raw content:', content);
                throw new Error('Failed to parse GPT response as JSON');
            }

        } catch (error) {
            console.error('GPT Service Error:', error);
            throw error;
        }
    }
} 