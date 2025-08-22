import sys
import json
import os
from ultralytics import YOLO

def analyze_image(image_path):
    try:
        # This makes sure the script can find the 'best.pt' file
        script_dir = os.path.dirname(__file__)
        model_path = os.path.join(script_dir, 'best.pt')

        
        model = YOLO(model_path) 

        # Run prediction on the image from the Node.js server
        results = model.predict(image_path, verbose=False)
        result = results[0]
        
        detected_classes = []
        if result.boxes and len(result.boxes) > 0:
            for box in result.boxes:
                class_id = int(box.cls[0])
                class_name = result.names[class_id]
                detected_classes.append(class_name)

        # --- Perform Violation Check ---
        violations = []
        billboards_found = 'billboard' in detected_classes
        qr_codes_found = 'qr_code' in detected_classes 

        if billboards_found and not qr_codes_found:
            violations.append("Potential Missing License (No QR Code detected).")
        
        

        # Prepare the final result
        analysis_result = {
            "detected_objects": detected_classes,
            "violations": violations
        }
        
        
        # It prints the results as a JSON string so our server can read it.
        print(json.dumps(analysis_result))

    except Exception as e:
        # If any error happens, send it back as JSON
        error_message = {"error": str(e)}
        print(json.dumps(error_message))
        sys.exit(1)


if __name__ == "__main__":
    # The image path is passed as an argument from our Node.js server
    if len(sys.argv) > 1:
        image_path_from_nodejs = sys.argv[1]
        analyze_image(image_path_from_nodejs)
    else:
        error_message = {"error": "No image path provided."}
        print(json.dumps(error_message))
        sys.exit(1)