// server/services/geminiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

// Make sure your .env file has this exact variable name: GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// YOUR TEAM'S HARD WORK IS 100% PRESERVED HERE.
// This is the detailed prompt that will guide the AI.
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
{
  "is_compliant": boolean,
  "summary": "string",
  "location_details": "string",
  "violations": [
    {
      "violation_type": "string (e.g., Placement, Structural Integrity)",
      "severity": "string (High, Medium, or Low)",
      "details": "string (A clear explanation of the violation)"
    }
  ]
}
`;

// Helper function to convert image file to base64
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

// Final, corrected function to analyze the image
async function analyzeWithGemini(imagePath, mimeType) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
            
        });

        const imageParts = [
            fileToGenerativePart(imagePath, mimeType),
        ];
        
        console.log("🤖 Sending request to Gemini API...");

        const result = await model.generateContent({
            contents: [{ role: "user", parts: imageParts }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const response = result.response;
        const jsonText = response.text();
        
        console.log("✅ Received valid JSON response from Gemini.");
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("❌ Error calling Gemini API:", error);
        // Instead of crashing, return a structured error that can be displayed
        return {
            is_compliant: false,
            summary: "Critical error during Gemini AI analysis.",
            location_details: "N/A due to error.",
            violations: [{ 
                violation_type: "AI Error", 
                severity: "High", 
                details: "The Gemini API call failed. Check the server console for details. This could be due to an invalid API key or a network issue."
            }]
        };
    }
}

module.exports = { analyzeWithGemini };