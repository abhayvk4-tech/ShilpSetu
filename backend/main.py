from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from PIL import Image, ImageEnhance, ImageOps
from typing import Optional
from pathlib import Path
import sqlite3
import shutil
import uuid
import os
import json
from dotenv import load_dotenv

# Load environment variables (.env)
load_dotenv()

# Google GenAI SDK
from google import genai
from google.genai import types

# Initialize Gemini client
client = genai.Client()

# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="ShilpSetu - Artisan AI Market Linkage API",
    description=(
        "Backend API for AI-driven product cataloging, "
        "image enhancement, multilingual support, "
        "smart pricing and artisan market linkage."
    ),
    version="1.0.0"
)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# FOLDERS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_FOLDER = BASE_DIR / "uploads"
GENERATED_FOLDER = BASE_DIR / "generated"

UPLOAD_FOLDER.mkdir(exist_ok=True)
GENERATED_FOLDER.mkdir(exist_ok=True)

# Make images accessible through browser/frontend
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_FOLDER)), name="uploads")
app.mount("/generated", StaticFiles(directory=str(GENERATED_FOLDER)), name="generated")

# ============================================================
# DATABASE
# ============================================================

DATABASE = BASE_DIR / "shilpsetu.db"

def get_db():
    db = sqlite3.connect(str(DATABASE))
    db.row_factory = sqlite3.Row
    return db

def initialize_database():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS artisans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            language TEXT DEFAULT 'English',
            location TEXT,
            craft_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            artisan_id INTEGER NOT NULL,
            product_name TEXT,
            image_path TEXT,
            enhanced_image_path TEXT,
            original_description TEXT,
            title TEXT,
            description TEXT,
            hindi_title TEXT,
            hindi_description TEXT,
            marathi_title TEXT,
            marathi_description TEXT,
            bengali_title TEXT,
            bengali_description TEXT,
            tamil_title TEXT,
            tamil_description TEXT,
            category TEXT,
            language TEXT DEFAULT 'English',
            material_cost REAL DEFAULT 0,
            recommended_price REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (artisan_id) REFERENCES artisans(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS product_ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            review TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS artisan_ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            artisan_id INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            review TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (artisan_id) REFERENCES artisans(id)
        )
    """)

    db.commit()
    db.close()

initialize_database()

# ============================================================
# DATA MODELS
# ============================================================

class ArtisanCreate(BaseModel):
    name: str = Field(..., min_length=1)
    phone: Optional[str] = None
    language: str = "English"
    location: Optional[str] = None
    craft_type: Optional[str] = None

class RatingCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review: Optional[str] = None

class PriceUpdate(BaseModel):
    material_cost: float = Field(..., ge=0)

# Schema for Gemini Structured Catalog Output
class AICatalogSchema(BaseModel):
    title: str = Field(description="Marketplace title in English")
    description: str = Field(description="Professional e-commerce product description in English celebrating artisan craft")
    hindi_title: str = Field(description="Authentic Hindi title in Devanagari script")
    hindi_description: str = Field(description="E-commerce description in Hindi")
    marathi_title: str = Field(description="Authentic Marathi title in Devanagari script")
    marathi_description: str = Field(description="E-commerce description in Marathi")
    bengali_title: str = Field(description="Authentic Bengali title in Bengali script")
    bengali_description: str = Field(description="E-commerce description in Bengali")
    tamil_title: str = Field(description="Authentic Tamil title in Tamil script")
    tamil_description: str = Field(description="E-commerce description in Tamil")
    category: str = Field(description="Standardized category: Home Decor, Kitchenware, Textiles, Toys, Jewelry, Pottery")

# ============================================================
# ROOT & HEALTH & STATS
# ============================================================

@app.get("/")
def home():
    return {
        "success": True,
        "application": "ShilpSetu",
        "message": "Artisan AI Market Linkage Backend is running",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
        "database": "connected"
    }

@app.get("/dashboard/stats")
def dashboard_stats():
    db = get_db()
    product_count = db.execute("SELECT COUNT(*) AS count FROM products").fetchone()["count"]
    artisan_count = db.execute("SELECT COUNT(*) AS count FROM artisans").fetchone()["count"]
    catalogue_value = db.execute("SELECT COALESCE(SUM(recommended_price), 0) AS total FROM products").fetchone()["total"]
    db.close()

    return {
        "success": True,
        "products_created": product_count,
        "artisans_registered": artisan_count,
        "catalogue_value": round(catalogue_value, 2),
        "languages_supported": ["English", "Hindi", "Marathi", "Bengali", "Tamil"],
        "smart_pricing": True
    }

# ============================================================
# ARTISAN APIs
# ============================================================

@app.post("/artisans")
def create_artisan(artisan: ArtisanCreate):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO artisans (name, phone, language, location, craft_type)
        VALUES (?, ?, ?, ?, ?)
    """, (artisan.name, artisan.phone, artisan.language, artisan.location, artisan.craft_type))
    artisan_id = cursor.lastrowid
    db.commit()
    db.close()
    return {
        "success": True,
        "artisan_id": artisan_id,
        "message": "Artisan created successfully"
    }

@app.get("/artisans")
def get_artisans():
    db = get_db()
    artisans = db.execute("SELECT * FROM artisans ORDER BY id DESC").fetchall()
    db.close()
    return {
        "success": True,
        "count": len(artisans),
        "artisans": [dict(a) for a in artisans]
    }

@app.get("/artisans/{artisan_id}")
def get_artisan(artisan_id: int):
    db = get_db()
    artisan = db.execute("SELECT * FROM artisans WHERE id = ?", (artisan_id,)).fetchone()
    if artisan is None:
        db.close()
        raise HTTPException(status_code=404, detail="Artisan not found")

    rating = db.execute("""
        SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS total_ratings
        FROM artisan_ratings WHERE artisan_id = ?
    """, (artisan_id,)).fetchone()
    db.close()

    result = dict(artisan)
    result["average_rating"] = round(rating["average_rating"], 2)
    result["total_ratings"] = rating["total_ratings"]
    return {"success": True, "artisan": result}

# ============================================================
# PRODUCT IMAGE UPLOAD
# ============================================================

@app.post("/products/upload-image")
async def upload_product_image(
    request: Request,
    artisan_id: int = Form(...),
    product_name: str = Form(""),
    description: str = Form(...),
    category: str = Form("Handicrafts"),
    language: str = Form("English"),
    material_cost: float = Form(0),
    image: UploadFile = File(...)
):
    db = get_db()
    artisan = db.execute("SELECT id FROM artisans WHERE id = ?", (artisan_id,)).fetchone()
    if artisan is None:
        db.close()
        raise HTTPException(status_code=404, detail="Artisan not found")

    extension = Path(image.filename or "").suffix.lower()
    if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
        db.close()
        raise HTTPException(status_code=400, detail="Only JPG, JPEG, PNG and WEBP images are supported")

    filename = f"{uuid.uuid4()}{extension}"
    filepath = UPLOAD_FOLDER / filename

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO products (artisan_id, product_name, image_path, original_description, category, language, material_cost)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (artisan_id, product_name, str(filepath), description, category, language, material_cost))
    product_id = cursor.lastrowid
    db.commit()
    db.close()

    base_url = str(request.base_url).rstrip("/")
    return {
        "success": True,
        "product_id": product_id,
        "product_name": product_name,
        "image_url": f"{base_url}/uploads/{filename}",
        "message": "Product image uploaded successfully"
    }

@app.get("/products")
def get_products():
    db = get_db()
    products = db.execute("""
        SELECT products.*, artisans.name AS artisan_name, artisans.location AS artisan_location, artisans.craft_type AS artisan_craft
        FROM products JOIN artisans ON products.artisan_id = artisans.id
        ORDER BY products.id DESC
    """).fetchall()

    result = []
    for product in products:
        item = dict(product)
        if item["image_path"]:
            item["image_url"] = "/uploads/" + Path(item["image_path"]).name
        if item["enhanced_image_path"]:
            item["enhanced_image_url"] = "/generated/" + Path(item["enhanced_image_path"]).name
        result.append(item)

    db.close()
    return {"success": True, "count": len(result), "products": result}

@app.get("/products/{product_id}")
def get_product(product_id: int):
    db = get_db()
    product = db.execute("""
        SELECT products.*, artisans.name AS artisan_name, artisans.location AS artisan_location, artisans.craft_type AS artisan_craft
        FROM products JOIN artisans ON products.artisan_id = artisans.id
        WHERE products.id = ?
    """, (product_id,)).fetchone()

    if product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")

    rating = db.execute("""
        SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS total_ratings
        FROM product_ratings WHERE product_id = ?
    """, (product_id,)).fetchone()

    result = dict(product)
    result["average_rating"] = round(rating["average_rating"], 2)
    result["total_ratings"] = rating["total_ratings"]
    if result["image_path"]:
        result["image_url"] = "/uploads/" + Path(result["image_path"]).name
    if result["enhanced_image_path"]:
        result["enhanced_image_url"] = "/generated/" + Path(result["enhanced_image_path"]).name

    db.close()
    return {"success": True, "product": result}

# ============================================================
# MULTIMODAL AI CATALOG GENERATOR (GEMINI 2.5 FLASH)
# ============================================================

def generate_catalog_with_ai(product_name: str, description: str, category: str, language: str, image_path: Optional[str] = None) -> dict:
    system_instruction = (
        "You are an expert Indian folk craft ethnographer and e-commerce cataloging specialist for ShilpSetu. "
        "Your mission is to empower rural Indian artisans. Analyze the provided product photo and notes, "
        "and generate professional, SEO-friendly marketplace titles and descriptions in English, Hindi, "
        "Marathi, Bengali, and Tamil. Maintain cultural authenticity and dignified storytelling."
    )

    user_prompt = (
        f"Artisan Provided Product Name: {product_name or 'Handmade Item'}\n"
        f"Artisan Raw Description / Notes: {description}\n"
        f"Suggested Category: {category or 'Handicrafts'}\n"
        f"Primary Language: {language}\n\n"
        "Generate authentic multilingual product listings adhering to the strict schema."
    )

    contents = []
    if image_path and Path(image_path).exists():
        with open(image_path, "rb") as img_file:
            img_bytes = img_file.read()
            mime_type = "image/jpeg" if image_path.endswith((".jpg", ".jpeg")) else "image/png"
            contents.append(types.Part.from_bytes(data=img_bytes, mime_type=mime_type))

    contents.append(user_prompt)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=AICatalogSchema,
            ),
        )
        data = json.loads(response.text)
        data["language"] = language
        return data
    except Exception as e:
        print(f"Gemini API error fallback: {e}")
        return {
            "title": f"Handcrafted {product_name or 'Artisan Product'}",
            "description": f"{description}. Authentic handmade craft reflecting traditional Indian heritage.",
            "hindi_title": f"हस्तनिर्मित {product_name or 'उत्पाद'}",
            "hindi_description": f"{description}. पारंपरिक भारतीय कारीगरी से निर्मित।",
            "marathi_title": f"हस्तनिर्मित {product_name or 'उत्पादन'}",
            "marathi_description": f"{description}. पारंपरिक कारागिरीचे उत्कृष्ट उदाहरण.",
            "bengali_title": f"হস্তনির্মিত {product_name or 'পণ্য'}",
            "bengali_description": f"{description}. ঐতিহ্যবাহী হস্তশিল্পের অনন্য নিদর্শন।",
            "tamil_title": f"கைவினை {product_name or 'பொருள்'}",
            "tamil_description": f"{description}. பாரம்பரிய கலைத்திறனுடன் உருவாக்கப்பட்டது.",
            "category": category or "Handicrafts",
            "language": language
        }

@app.post("/products/{product_id}/generate-catalog")
def generate_product_catalog(product_id: int):
    db = get_db()
    product = db.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")

    catalog = generate_catalog_with_ai(
        product_name=product["product_name"] or "",
        description=product["original_description"] or "",
        category=product["category"] or "Handicrafts",
        language=product["language"] or "English",
        image_path=product["image_path"]
    )

    db.execute("""
        UPDATE products
        SET title = ?, description = ?,
            hindi_title = ?, hindi_description = ?,
            marathi_title = ?, marathi_description = ?,
            bengali_title = ?, bengali_description = ?,
            tamil_title = ?, tamil_description = ?,
            category = ?
        WHERE id = ?
    """, (
        catalog["title"], catalog["description"],
        catalog["hindi_title"], catalog["hindi_description"],
        catalog["marathi_title"], catalog["marathi_description"],
        catalog["bengali_title"], catalog["bengali_description"],
        catalog["tamil_title"], catalog["tamil_description"],
        catalog["category"],
        product_id
    ))
    db.commit()
    db.close()

    return {
        "success": True,
        "product_id": product_id,
        "catalog": catalog,
        "message": "AI product catalogue generated successfully"
    }

@app.get("/products/{product_id}/translation")
def get_product_translation(product_id: int, language: str = "English"):
    db = get_db()
    product = db.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    db.close()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    language_lower = language.lower()
    if language_lower == "hindi":
        title = product["hindi_title"]
        description = product["hindi_description"]
    elif language_lower == "marathi":
        title = product["marathi_title"]
        description = product["marathi_description"]
    elif language_lower == "bengali":
        title = product["bengali_title"]
        description = product["bengali_description"]
    elif language_lower == "tamil":
        title = product["tamil_title"]
        description = product["tamil_description"]
    else:
        title = product["title"]
        description = product["description"]

    return {
        "success": True,
        "product_id": product_id,
        "language": language,
        "title": title or product["title"],
        "description": description or product["description"]
    }

# ============================================================
# IMAGE ENHANCEMENT
# ============================================================

@app.post("/products/{product_id}/enhance-image")
def enhance_product_image(product_id: int, request: Request):
    db = get_db()
    product = db.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")

    image_path = product["image_path"]
    if not image_path or not Path(image_path).exists():
        db.close()
        raise HTTPException(status_code=404, detail="Original image file not found")

    try:
        image = Image.open(image_path).convert("RGB")
        image = ImageEnhance.Brightness(image).enhance(1.10)
        image = ImageEnhance.Contrast(image).enhance(1.15)
        image = ImageEnhance.Sharpness(image).enhance(1.20)
        image = ImageOps.contain(image, (1080, 1080))

        canvas = Image.new("RGB", (1080, 1080), "white")
        x = (1080 - image.width) // 2
        y = (1080 - image.height) // 2
        canvas.paste(image, (x, y))

        output_filename = f"enhanced_{uuid.uuid4()}.jpg"
        output_path = GENERATED_FOLDER / output_filename
        canvas.save(output_path, "JPEG", quality=95)

        db.execute("UPDATE products SET enhanced_image_path = ? WHERE id = ?", (str(output_path), product_id))
        db.commit()
        db.close()

        base_url = str(request.base_url).rstrip("/")
        return {
            "success": True,
            "product_id": product_id,
            "enhanced_image_url": f"{base_url}/generated/{output_filename}",
            "message": "Product image enhanced successfully"
        }
    except Exception as error:
        db.close()
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(error)}")

# ============================================================
# DYNAMIC FAIR-TRADE PRICING MODEL
# ============================================================

class AIPricingSchema(BaseModel):
    recommended_price: float = Field(description="Fair retail price in INR")
    labour_cost: float = Field(description="Estimated fair compensation for artisan labor hours in INR")
    craftsmanship_value: float = Field(description="Artistic heritage and technique premium in INR")
    marketplace_margin: float = Field(description="Logistics and platform buffer in INR")
    pricing_status: str = Field(description="e.g. Fair Trade Verified")
    explanation_text: str = Field(description="One-sentence breakdown of how the price honors the artisan")

@app.post("/products/{product_id}/price")
def calculate_price(product_id: int):
    db = get_db()
    product = db.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")

    material_cost = float(product["material_cost"] or 300)
    if material_cost <= 0:
        material_cost = 300.0

    prompt = (
        f"Product: {product['title'] or product['product_name'] or 'Handicraft'}\n"
        f"Category: {product['category']}\n"
        f"Raw Material Cost: INR {material_cost}\n"
        "Calculate a fair-trade retail price that guarantees the artisan is ethically compensated for their time."
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt],
            config=types.GenerateContentConfig(
                system_instruction="You are a fair-trade pricing analyst for traditional Indian crafts.",
                temperature=0.1,
                response_mime_type="application/json",
                response_schema=AIPricingSchema,
            ),
        )
        pricing_data = json.loads(response.text)
        recommended_price = pricing_data["recommended_price"]
        explanation = {
            "material_cost": round(material_cost, 2),
            "labour_cost": round(pricing_data["labour_cost"], 2),
            "craftsmanship_value": round(pricing_data["craftsmanship_value"], 2),
            "marketplace_margin": round(pricing_data["marketplace_margin"], 2)
        }
        status_msg = pricing_data["pricing_status"]
    except Exception as e:
        print(f"Pricing model fallback: {e}")
        labour_cost = material_cost * 0.60
        craftsmanship_value = material_cost * 0.40
        marketplace_margin = material_cost * 0.25
        recommended_price = round(material_cost + labour_cost + craftsmanship_value + marketplace_margin, -1)
        explanation = {
            "material_cost": round(material_cost, 2),
            "labour_cost": round(labour_cost, 2),
            "craftsmanship_value": round(craftsmanship_value, 2),
            "marketplace_margin": round(marketplace_margin, 2)
        }
        status_msg = "Fair Price (Rule-based)"

    db.execute("UPDATE products SET recommended_price = ? WHERE id = ?", (recommended_price, product_id))
    db.commit()
    db.close()

    return {
        "success": True,
        "product_id": product_id,
        "currency": "INR",
        "material_cost": material_cost,
        "recommended_price": recommended_price,
        "pricing_status": status_msg,
        "explanation": explanation
    }

@app.put("/products/{product_id}/material-cost")
def update_material_cost(product_id: int, data: PriceUpdate):
    db = get_db()
    product = db.execute("SELECT id FROM products WHERE id = ?", (product_id,)).fetchone()
    if product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")

    db.execute("UPDATE products SET material_cost = ? WHERE id = ?", (data.material_cost, product_id))
    db.commit()
    db.close()
    return {
        "success": True,
        "product_id": product_id,
        "material_cost": data.material_cost,
        "message": "Material cost updated successfully"
    }

@app.post("/products/{product_id}/ratings")
def rate_product(product_id: int, rating_data: RatingCreate):
    db = get_db()
    product = db.execute("SELECT id FROM products WHERE id = ?", (product_id,)).fetchone()
    if product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")

    db.execute("INSERT INTO product_ratings (product_id, rating, review) VALUES (?, ?, ?)",
               (product_id, rating_data.rating, rating_data.review))
    db.commit()
    db.close()
    return {"success": True, "product_id": product_id, "rating": rating_data.rating, "message": "Product rating submitted successfully"}

@app.get("/products/{product_id}/ratings")
def get_product_ratings(product_id: int):
    db = get_db()
    product = db.execute("SELECT id FROM products WHERE id = ?", (product_id,)).fetchone()
    if product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")

    ratings = db.execute("SELECT * FROM product_ratings WHERE product_id = ? ORDER BY id DESC", (product_id,)).fetchall()
    average = db.execute("SELECT COALESCE(AVG(rating), 0) AS average_rating FROM product_ratings WHERE product_id = ?", (product_id,)).fetchone()
    db.close()
    return {"success": True, "product_id": product_id, "average_rating": round(average["average_rating"], 2), "total_ratings": len(ratings), "ratings": [dict(r) for r in ratings]}

@app.post("/artisans/{artisan_id}/ratings")
def rate_artisan(artisan_id: int, rating_data: RatingCreate):
    db = get_db()
    artisan = db.execute("SELECT id FROM artisans WHERE id = ?", (artisan_id,)).fetchone()
    if artisan is None:
        db.close()
        raise HTTPException(status_code=404, detail="Artisan not found")

    db.execute("INSERT INTO artisan_ratings (artisan_id, rating, review) VALUES (?, ?, ?)",
               (artisan_id, rating_data.rating, rating_data.review))
    db.commit()
    db.close()
    return {"success": True, "artisan_id": artisan_id, "rating": rating_data.rating, "message": "Artisan rating submitted successfully"}

@app.get("/search")
def search_products(q: str):
    db = get_db()
    search_term = f"%{q}%"
    products = db.execute("""
        SELECT products.*, artisans.name AS artisan_name
        FROM products JOIN artisans ON products.artisan_id = artisans.id
        WHERE products.product_name LIKE ? OR products.title LIKE ? OR products.description LIKE ? OR products.category LIKE ? OR artisans.name LIKE ?
        ORDER BY products.id DESC
    """, (search_term, search_term, search_term, search_term, search_term)).fetchall()
    db.close()
    return {"success": True, "query": q, "count": len(products), "products": [dict(p) for p in products]}

# ============================================================
# VOICE INPUT (GEMINI NATIVE SPEECH-TO-TEXT & TRANSLATION)
# ============================================================

@app.post("/voice/transcribe")
async def transcribe_voice(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        mime_type = audio.content_type or "audio/mp3"

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
                "Listen to this audio recorded by a rural Indian artisan. Transcribe exactly what they say into clear text, and provide an English translation if spoken in Hindi or another regional language. Return as JSON: {\"transcription\": \"...\", \"translation\": \"...\"}"
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        parsed = json.loads(response.text)
        return {
            "success": True,
            "filename": audio.filename,
            "transcription": parsed.get("transcription", ""),
            "translation": parsed.get("translation", ""),
            "message": "Voice processed successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "filename": audio.filename,
            "error": str(e),
            "transcription": "Voice transcription service unavailable",
            "translation": "Voice transcription service unavailable"
        }

# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)