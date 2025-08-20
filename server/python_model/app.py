# app.py (Final Version with YOLOv8 and Gemini)
import os
import io
import json
import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
from ultralytics import YOLO

# --- CONFIGURATION ---
# Load the Gemini API Key from Hugging Face Secrets
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the FastAPI app
app = FastAPI(title="Hybrid Billboard Analysis API (YOLOv8 + Gemini)")

# Load your custom-trained YOLOv8 model
yolo_model = YOLO("best.pt")

# Configure the Gemini model
gemini_model = genai.GenerativeModel('gemini-2.5-flash')

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
            yolo_violations.append(
                f"YOLOv8: Detected '{class_name}' with {confidence:.2f} confidence."
            )

    # --- GEMINI ANALYSIS ---
    try:
        prompt = """
        Analyze the provided image of an outdoor advertisement billboard. Your task is to act as a municipal compliance inspector. Based on the image, identify any potential violations of standard advertising regulations. Focus on these areas:
        1.  **Structural safety:** Is the structure visibly damaged, rusted, or unstable?
        2.  **Content:** Does it contain offensive language, hate speech, or inappropriate imagery?
        3.  **Placement:** Is it obstructing traffic views, public signs, or pedestrian pathways? Is it placed too close to a sensitive area like a school or hospital?
        4.  **Condition:** Is the advertisement torn, faded, or poorly maintained?
        Return your findings ONLY as a JSON object with a single key "gemini_violations", which is an array of strings. Each string should describe a single, distinct violation. If there are no violations, return an empty array.
        """
        response = gemini_model.generate_content([prompt, image])
        response_text = response.text.strip().replace("```json", "").replace("```", "")
        gemini_data = json.loads(response_text)
        gemini_violations = gemini_data.get("gemini_violations", [])
    except Exception as e:
        gemini_violations = [f"Gemini Error: {str(e)}"]

    # --- COMBINE RESULTS ---
    combined_violations = yolo_violations + gemini_violations
    final_output = { "violations": combined_violations }
    return JSONResponse(status_code=200, content=final_output)