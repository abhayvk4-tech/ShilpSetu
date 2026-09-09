ShilpSetu (शिल्पसेतु) 🏺

A simple way for traditional Indian artisans to turn their craft into digital product listings using AI.

About the Project

ShilpSetu is an AI-powered platform designed to help rural and marginalized artisans sell their products online.

The idea is simple: an artisan can upload a photo of a handmade product and provide some basic information about it. The application uses Gemini AI to analyze the product and help create a product listing with details such as the craft type, material, description, tags, and an estimated price range.

The goal is to reduce the amount of technical work an artisan has to do before putting their products online.

Features
AI Product Cataloging
Upload a product image and let the AI identify details such as the craft type, material, category, and visible design elements.
Pricing Assistance
Provides an estimated price range to help artisans understand how their product could be priced. The estimate is intended as guidance and can be reviewed by the artisan.
Multilingual Listings
Product descriptions can be generated in different languages, including Hindi and English.
Voice Input
Artisans can describe their products using their voice instead of having to type everything manually.
Product Preview
Automatically generated product information can be viewed as a catalog card before publishing.
Digital Marketplace
Products can be displayed in a marketplace where buyers can browse different crafts and products.
AI-Assisted Market Matching
AI can suggest potential buyer groups such as gift shops, home décor stores, eco-friendly retailers, and interior designers based on the product.
How It Works
Artisan
   ↓
Upload Product Photo
   ↓
AI Analysis (Gemini)
   ↓
Product Details Generated
   ↓
Artisan Reviews / Edits
   ↓
Product Listing
   ↓
Marketplace
   ↓
Buyer Enquiry
Tech Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Backend
Python
FastAPI
Gemini API
Database / Storage
Supabase
PostgreSQL
Supabase Storage
Project Structure
ShilpSetu/
│
├── app/                    # Next.js frontend
│   ├── services/
│   │   └── api.ts          # Backend API communication
│   └── page.tsx            # Main application UI
│
├── backend/                # FastAPI backend
│   ├── main.py             # API and Gemini integration
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable template
│
├── public/                 # Static assets
│
└── README.md
Getting Started
Prerequisites

Make sure you have the following installed:

Node.js 18 or newer
Python 3.10 or newer
A Gemini API key
1. Clone the repository
git clone <repository-url>
cd ShilpSetu
2. Set up the backend

Go to the backend directory:

cd backend

Create a Python virtual environment:

Windows (PowerShell):

python -m venv venv
.\venv\Scripts\Activate.ps1

Linux / macOS:

python3 -m venv venv
source venv/bin/activate

Install the required packages:

pip install -r requirements.txt

Create your environment file:

cp .env.example .env

Add your Gemini API key to .env:

GEMINI_API_KEY=your_gemini_api_key
PORT=8000

Start the backend:

python main.py

The API should now be available at:

http://localhost:8000
3. Set up the frontend

Open another terminal and return to the project root:

cd ShilpSetu

Install the dependencies:

npm install

Start the development server:

npm run dev

The frontend should be available at:

http://localhost:3000
Environment & Security

API keys and other sensitive configuration should not be committed to the repository.

The following are kept out of Git using .gitignore:

.env files
Python virtual environments (venv/)
Local database files
Other local configuration files

Use backend/.env.example as a template when setting up the project locally.

Project Scope

ShilpSetu is being developed as a hackathon project and focuses on demonstrating the core idea of AI-assisted catalog creation and market access for artisans.

The current implementation focuses on the main workflow:

Product → AI Analysis → Catalog → Review → Marketplace → Buyer Enquiry

More advanced features such as payments, logistics, advanced recommendation systems, and large-scale marketplace infrastructure can be added in future versions.

Future Improvements

Some features we would like to explore in future versions include:

Better recognition of regional and traditional crafts
Support for more Indian languages
Offline/low-connectivity support
Improved pricing models based on local market data
Direct buyer-artisan communication
Integration with existing e-commerce platforms
Analytics to help artisans understand which products perform best
Hackathon

Problem Statement: SIH26090

Theme: AI-Driven Market Linkage and Smart Cataloging for Marginalized Artisans

Project: ShilpSetu (शिल्पसेतु)

Team

Built as a Smart India Hackathon 2026 project.

ShilpSetu — helping traditional craft find a place in the digital marketplace.