# ShilpSetu

ShilpSetu (`शिल्पसेतु` - Craft Bridge) is a full-stack platform designed to empower Indian artisans by leveraging AI to bridge the gap between traditional craft and modern e-commerce. The application allows artisans to upload a photo of their craft and receive a professional, market-ready product listing, including enhanced images, multilingual descriptions, and fair-trade pricing.

##  Key Features

*   **AI-Powered Catalog Generation**: Uses Google's Gemini 2.5 Flash model to generate compelling, culturally-aware product titles and descriptions from a simple image and a few notes.
*   **Multilingual Support**: Automatically translates product listings into multiple Indian languages (English, Hindi, Marathi, Bengali, Tamil) to reach a wider audience.
*   **Fair-Trade Smart Pricing**: An AI-driven module that analyzes the product and material cost to suggest an ethical and competitive retail price, ensuring fair compensation for the artisan.
*   **Studio Image Enhancement**: A backend service that automatically processes uploaded images to improve lighting, contrast, and framing, creating a professional "studio shot" look.
*   **Voice-to-Text for Descriptions**: Artisans can simply speak a description of their product, which is transcribed and used as input for the AI, overcoming literacy barriers.
*   **Full-Stack Architecture**: Built with a modern stack featuring a Next.js frontend and a Python (FastAPI) backend.

##  Tech Stack

*   **Frontend**: Next.js, React, TypeScript, Tailwind CSS
*   **Backend**: Python, FastAPI, Uvicorn
*   **Database**: SQLite
*   **AI**: Google Gemini 2.5 Flash API (for multimodal understanding, text generation, and speech-to-text)
*   **Image Processing**: Pillow

##  How It Works: The AI Pipeline

The core of ShilpSetu is an automated pipeline that transforms a raw product upload into a complete e-commerce listing.

1.  **Upload**: The artisan uploads a product photo and provides a basic description. They can type the description or use the microphone to record a voice note.
2.  **Voice Transcription**: If a voice note is provided, it is sent to the backend's `/voice/transcribe` endpoint, where the Gemini API transcribes the audio to text.
3.  **Image & Data Storage**: The original image and metadata (artisan's description, material cost, etc.) are saved, and a new product entry is created in the database.
4.  **Image Enhancement**: The backend enhances the uploaded image by adjusting brightness and contrast and padding it onto a clean white background to create a uniform, professional look.
5.  **Multilingual Cataloging**: The enhanced image and the artisan's description are sent to the Gemini multimodal endpoint. A specialized prompt guides the AI to generate a complete catalog with titles and descriptions in five different languages.
6.  **Smart Pricing**: The product details and material cost are fed to another AI-powered endpoint, which calculates a fair-trade retail price, breaking it down into material cost, labor, craftsmanship value, and marketplace margin.
7.  **Display**: The frontend receives all the generated data and displays a complete, professional product page with the enhanced image, AI-generated descriptions (with a language switcher), and the certified fair price.

##  Getting Started

To run this project locally, you will need Node.js, Python, and a Google Gemini API key.

### 1. Backend Setup

First, set up and run the FastAPI backend server.

```bash
# Clone the repository
git clone https://github.com/abhayvk4-tech/ShilpSetu.git
cd ShilpSetu/backend

# Create and activate a Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install the required Python packages
pip install -r requirements.txt

# Create a .env file from the example
cp .env.example .env

# Add your Google Gemini API key to the .env file
# GEMINI_API_KEY=your_gemini_api_key_here

# The backend database 'shilpsetu.db' will be created automatically.
# Run the backend server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API will be available at `http://localhost:8000`.

### 2. Frontend Setup

In a new terminal, set up and run the Next.js frontend.

```bash
# Navigate to the root project directory
cd .. 

# Install npm dependencies
npm install

# Run the frontend development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application. The frontend is configured to communicate with the backend running on port 8000.

## 📋 API Endpoints

The FastAPI backend provides the following core endpoints:

| Method | Endpoint                             | Description                                                    |
| :----- | :----------------------------------- | :------------------------------------------------------------- |
| `POST` | `/products/upload-image`             | Upload a product image and initial metadata.                   |
| `POST` | `/products/{id}/enhance-image`       | Trigger the AI image enhancement module.                       |
| `POST` | `/products/{id}/generate-catalog`    | Generate multilingual titles and descriptions using Gemini.    |
| `POST` | `/products/{id}/price`               | Calculate the fair-trade price for the product.                |
| `GET`  | `/products`                          | Fetch all products from the database for the marketplace feed. |
| `GET`  | `/products/{id}`                     | Get details for a single product.                              |
| `POST` | `/voice/transcribe`                  | Transcribe an uploaded audio file to text.                     |
| `GET`  | `/artisans`                          | List all registered artisans.                                  |