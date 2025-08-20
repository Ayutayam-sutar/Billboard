# CORRECT Dockerfile for Hugging Face AI Service

# Start with a Python 3.9 image
FROM python:3.9-slim


# --- NEW LINE TO FIX THE libGL.so.1 ERROR ---
# --- FINAL CORRECTED LINE TO FIX ALL OPENCV ERRORS ---
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0

# Set the working directory inside the container
WORKDIR /code

# Copy ONLY the requirements file first to leverage Docker cache
COPY ./python_model/requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy your application code and model into the container
COPY ./python_model/ .

# Tell Docker that the container listens on port 7860 (for Hugging Face)
EXPOSE 7860

# The command to run your FastAPI app when the container starts
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]