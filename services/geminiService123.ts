
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        is_compliant: { 
            type: Type.BOOLEAN, 
            description: "Overall compliance status. True if no violations are found, false otherwise." 
        },
        violations: {
            type: Type.ARRAY,
            description: "A list of identified violations. The list is empty if the billboard is compliant.",
            items: {
                type: Type.OBJECT,
                properties: {
                    violation_type: { 
                        type: Type.STRING, 
                        enum: ['Placement', 'Content', 'Structural', 'Size', 'Authorization', 'Other'],
                        description: "The type of violation." 
                    },
                    details: { 
                        type: Type.STRING, 
                        description: "A detailed explanation of why this is a violation, based on the rules." 
                    },
                    severity: { 
                        type: Type.STRING, 
                        enum: ['High', 'Medium', 'Low'],
                        description: "The severity of the violation." 
                    }
                },
                required: ["violation_type", "details", "severity"]
            }
        },
        summary: { 
            type: Type.STRING, 
            description: "A brief, one or two-sentence summary of the findings for the user." 
        },
        location_details: {
            type: Type.STRING,
            description: "A brief description of the billboard's location based on visible landmarks, street signs, or other context from the image (e.g., 'Near a large shopping mall', 'On a highway exit'). If no context is available, state that."
        }
    },
    required: ["is_compliant", "violations", "summary", "location_details"]
};

const systemInstruction = `You are an AI assistant acting as a billboard compliance inspector for Indian cities, analyzing images based on a simplified version of the 'Model Outdoor Advertising Policy'.

Your task is to analyze the provided image of a billboard, identify its location from visual cues, and determine if it complies with the following rules. Respond ONLY with the JSON format defined in the schema.

**Compliance Rules:**

1.  **Placement:**
    -   **Violation (High Severity):** If the billboard obstructs traffic signals, road signs, or is placed directly at a road intersection or on a sharp curve.
    -   **Violation (Medium Severity):** If the billboard is on a bridge or overpass.

2.  **Size & Shape:**
    -   **Violation (Low Severity):** If the billboard's aspect ratio appears to be disproportionately large, wider than a 3:1 (width:height) ratio.

3.  **Structural Integrity:**
    -   **Violation (High Severity):** If there are visible signs of significant rust, decay, bending, or if the structure looks unstable or poorly maintained.
    -   **Violation (Medium Severity):** If there are minor signs of wear and tear, like peeling paint or small damaged sections.

4.  **Content:**
    -   **Violation (High Severity):** If the content is obscene, derogatory, promotes violence, or is political/religious in nature.
    -   **Violation (Medium Severity):** If the content is overly flashy, uses rapidly changing lights, or seems designed to distract drivers excessively.

5.  **Authorization:**
    -   **Violation (Low Severity):** If a designated area for a license number or QR code appears to be present but is empty, or if the billboard is large and clearly commercial without any visible identifier. Do not flag this violation if the billboard is small, simple, or appears to be for a local, non-commercial event.

**Analysis Process:**

-   First, describe the location based on any visible street signs, landmarks, or other contextual clues in the image.
-   Carefully examine the image provided.
-   Identify all applicable violations from the list above.
-   If no violations are found, return \`is_compliant: true\` and an empty \`violations\` array.
-   If any violations are found, return \`is_compliant: false\` and populate the \`violations\` array accordingly.
-   Provide a concise summary of your findings.
`;

export const analyzeBillboard = async (base64Image: string): Promise<AnalysisResult> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };

        const textPart = {
            text: "Please analyze this billboard image for location and compliance based on the rules."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2
            }
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (typeof parsedJson.is_compliant !== 'boolean' || !Array.isArray(parsedJson.violations)) {
            throw new Error("AI response did not match the expected format.");
        }
        
        return parsedJson as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to analyze billboard: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while analyzing the billboard.");
    }
};
