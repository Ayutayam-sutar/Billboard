# Start with a virtual computer that has Node.js version 18 installed
FROM node:18

# Install the tools needed for Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Create a folder inside the virtual computer for our app
WORKDIR /usr/src/app

# Copy the package files first for build optimization
COPY package*.json ./

# Install all the Node.js libraries
RUN npm install

# Copy the Python requirements file into its correct folder
COPY ./python_model/requirements.txt ./python_model/

# Install all the Python libraries from the requirements file
RUN pip install -r ./python_model/requirements.txt --break-system-packages
# Copy the rest of your server code into the virtual computer
COPY . .

# Tell Hugging Face that your app will be running on port 3001
EXPOSE 3001

# The final command to start your server when the container starts
CMD [ "node", "start" ]