# app.py (Final Corrected Version)
import os
import io
import json
import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

# --- CONFIGURATION ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set!")
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Hybrid Billboard Analysis API (YOLOv8 + Gemini)")

# --- CORS MIDDLEWARE 
# This allows our frontend app to communicate with this API
origins = [
    "http://localhost",
    "http://localhost:5173",
    "https://billboard-inspect.netlify.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

yolo_model = YOLO("best.pt")
gemini_model = genai.GenerativeModel('gemini-1.5-flash') 

# --- API ENDPOINTS ---
@app.get("/")
def read_root():
    """A simple endpoint to confirm the API is running."""
    return {"status": "ok", "message": "Hybrid AI Analysis API is running."}

@app.post("/analyze-hybrid/")
async def analyze_billboard(file: UploadFile = File(...)):
    """
    Analyzes an uploaded billboard image using both YOLOv8 and Gemini.
    """
    # --- IMAGE PREPARATION ---
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    # --- YOLOv8 ANALYSIS ---
    yolo_results = yolo_model(image)
    yolo_violations = []
    for result in yolo_results:
        for box in result.boxes:
            class_name = yolo_model.names[int(box.cls[0])]
            confidence = float(box.conf[0])
            yolo_violations.append({
                "violation_type": "Object Detection",
                "severity": "Informational",
                "details": f"YOLOv8: Detected '{class_name}' with {confidence:.2f} confidence."
            })

    # --- GEMINI ANALYSIS ---
    try:
        # <-- 1. THIS IS THE DETAILED PROMPT COPIED FROM YOUR geminiService.js
        prompt = """
        You are an AI assistant acting as a billboard compliance inspector for Indian cities.
        Your task is to analyze the provided image of a billboard, identify its location from visual cues, and determine if it complies with the following rules.
        Respond ONLY with a valid JSON object matching the specified schema.

        **Compliance Rules:**
        1. Placement: Violations for obstructing traffic signals, signs, being on curves, bridges, or overpasses.
        2. Size & Shape: Violation if aspect ratio is wider than 3:1.
        3. Structural Integrity: Violations for rust, decay, bending, or poor maintenance.
        4. Content: Violations for obscene, derogatory, violent, political/religious content, or overly distracting lights.
        5. Authorization: Violation if a license number area is present but empty on a large commercial billboard.

        **JSON Schema to follow:**
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
        """
        response = gemini_model.generate_content(
            [prompt, image],
            generation_config={"response_mime_type": "application/json"}
        )
        gemini_analysis = json.loads(response.text)

    except Exception as e:
        # If Gemini fails, create a structured error message
        gemini_analysis = {
            "is_compliant": False,
            "summary": "Critical error during Gemini AI analysis.",
            "location_details": "N/A due to error.",
            "violations": [{
                "violation_type": "AI Error",
                "severity": "High",
                "details": f"The Gemini API call failed: {str(e)}"
            }]
        }

    # <-- 2. THIS IS THE CORRECTED FINAL OUTPUT LOGIC
    # Combine the violations lists
    combined_violations = yolo_violations + gemini_analysis.get("violations", [])

    # Use the overall structure from Gemini's analysis
    final_output = {
        "is_compliant": gemini_analysis.get("is_compliant", False),
        "summary": gemini_analysis.get("summary", "No summary available."),
        "location_details": gemini_analysis.get("location_details", "No location detected."),
        "violations": combined_violations
    }

    # If there are any violations at all, ensure is_compliant is false
    if final_output["violations"]:
        final_output["is_compliant"] = False

    return JSONResponse(status_code=200, content=final_output)