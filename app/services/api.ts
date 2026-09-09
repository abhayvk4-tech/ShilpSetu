const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UploadProductParams {
  artisanId: number;
  productName: string;
  description: string;
  category: string;
  language: string;
  materialCost: number;
  imageFile: File;
}

export interface CatalogData {
  title: string;
  description: string;
  hindi_title: string;
  hindi_description: string;
  marathi_title: string;
  marathi_description: string;
  bengali_title: string;
  bengali_description: string;
  tamil_title: string;
  tamil_description: string;
  category: string;
  language: string;
}

export interface PricingData {
  recommended_price: number;
  currency: string;
  material_cost: number;
  pricing_status: string;
  explanation: {
    material_cost: number;
    labour_cost: number;
    craftsmanship_value: number;
    marketplace_margin: number;
  };
}

/**
 * 1. Upload initial craft image & metadata
 */
export async function uploadProductImage(params: UploadProductParams) {
  const formData = new FormData();
  formData.append("artisan_id", params.artisanId.toString());
  formData.append("product_name", params.productName);
  formData.append("description", params.description);
  formData.append("category", params.category || "Handicrafts");
  formData.append("language", params.language || "English");
  formData.append("material_cost", params.materialCost.toString());
  formData.append("image", params.imageFile);

  const res = await fetch(`${API_BASE_URL}/products/upload-image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Image upload failed");
  }

  return await res.json(); // { product_id, image_url, ... }
}

/**
 * 2. Enhance image (Studio Module)
 */
export async function enhanceProductImage(productId: number) {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/enhance-image`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Enhancement failed" }));
    throw new Error(err.detail || "Image enhancement failed");
  }

  return await res.json(); // { enhanced_image_url }
}

/**
 * 3. Generate Multilingual Catalog via Gemini AI
 */
export async function generateAICatalog(productId: number): Promise<{ success: boolean; catalog: CatalogData }> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/generate-catalog`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "AI Catalog generation failed" }));
    throw new Error(err.detail || "AI catalog generation failed");
  }

  return await res.json();
}

/**
 * 4. Calculate Dynamic Fair-Trade Pricing via Gemini AI
 */
export async function calculateAIPricing(productId: number): Promise<PricingData> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/price`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Pricing calculation failed" }));
    throw new Error(err.detail || "Pricing calculation failed");
  }

  return await res.json();
}

/**
 * 5. Fetch all published products for marketplace
 */
export async function fetchAllProducts() {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return await res.json();
}
/**
 * 6. Transcribe & translate artisan voice notes via Gemini
 */
export async function transcribeVoiceAudio(audioBlob: Blob): Promise<{ transcription: string; translation: string }> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "voice_input.webm");

  const res = await fetch(`${API_BASE_URL}/voice/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Audio processing failed" }));
    throw new Error(err.detail || "Audio transcription failed");
  }

  return await res.json();
}