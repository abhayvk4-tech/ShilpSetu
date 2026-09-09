"use client";

import { useState, useEffect, useRef } from "react";
import {
  uploadProductImage,
  enhanceProductImage,
  generateAICatalog,
  calculateAIPricing,
  fetchAllProducts,
  transcribeVoiceAudio,
  CatalogData,
  PricingData,
} from "./services/api";

export default function Home() {
  // Modal & Flow States
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [generated, setGenerated] = useState(false);
  const [catalogueAdded, setCatalogueAdded] = useState(false);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Form Inputs
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Handicrafts");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [materialCost, setMaterialCost] = useState(300);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Output States
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string>("");
  const [catalogResult, setCatalogResult] = useState<CatalogData | null>(null);
  const [pricingResult, setPricingResult] = useState<PricingData | null>(null);

  // Marketplace Products Feed
  const [marketplaceProducts, setMarketplaceProducts] = useState<any[]>([]);

  // Base URL for image paths
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Load existing products on initial load
  const loadProducts = async () => {
    try {
      const data = await fetchAllProducts();
      if (data && data.products) {
        setMarketplaceProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle Photo Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }
};

  // Start Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        try {
          setRecordingStatus("Transcribing voice...");
          const res = await transcribeVoiceAudio(audioBlob);
          if (res.transcription) {
            setDescription((prev) =>
              prev ? `${prev} ${res.transcription}` : res.transcription
            );
          }
        } catch (err) {
          console.error("Voice transcription failed:", err);
          alert("Could not transcribe voice audio. Please check mic permissions.");
        } finally {
          setRecordingStatus("");
          setIsRecording(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingStatus("Listening... Tap again to finish");
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Please allow microphone permissions in your browser.");
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // View Existing Product Handler
  const handleViewProduct = (product: any) => {
    const rawImg = product.enhanced_image_url || product.image_url || "";
    const cleanImg = rawImg.startsWith("http") ? rawImg : `${backendBaseUrl}${rawImg}`;

    setEnhancedImageUrl(cleanImg);
    setCatalogResult({
      title: product.title || product.product_name || "Handcrafted Product",
      description: product.description || product.original_description || "",
      hindi_title: product.hindi_title || product.product_name || "",
      hindi_description: product.hindi_description || product.description || "",
      marathi_title: product.marathi_title || product.product_name || "",
      marathi_description: product.marathi_description || product.description || "",
      bengali_title: product.bengali_title || product.product_name || "",
      bengali_description: product.bengali_description || product.description || "",
      tamil_title: product.tamil_title || product.product_name || "",
      tamil_description: product.tamil_description || product.description || "",
      category: product.category || "Handicrafts",
      language: product.language || "English",
    });

    setPricingResult({
      recommended_price: product.recommended_price || 0,
      currency: "INR",
      material_cost: product.material_cost || 0,
      pricing_status: "Verified Listing",
      explanation: {
        material_cost: product.material_cost || 0,
        labour_cost: Math.round((product.material_cost || 0) * 0.6),
        craftsmanship_value: Math.round((product.material_cost || 0) * 0.4),
        marketplace_margin: Math.round((product.material_cost || 0) * 0.25),
      },
    });

    setGenerated(true);
    setCatalogueAdded(true);

    // Smooth scroll down to review section
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Pipeline execution
  const handleGenerateAI = async () => {
    if (!selectedFile) {
      alert("Please upload a product photo first.");
      return;
    }
    if (!description.trim()) {
      alert("Please enter a short description of the craft.");
      return;
    }

    setLoading(true);
    setStatusMessage("Uploading craft photo...");

    try {
      const uploadRes = await uploadProductImage({
        artisanId: 1,
        productName: productName.trim() || "Traditional Handicraft",
        description: description.trim(),
        category,
        language: selectedLanguage,
        materialCost,
        imageFile: selectedFile,
      });

      const newProductId = uploadRes.product_id;

      setStatusMessage("AI Studio: Normalizing lighting & studio frame...");
      try {
        const enhancedRes = await enhanceProductImage(newProductId);
        const url = enhancedRes.enhanced_image_url;
        setEnhancedImageUrl(url.startsWith("http") ? url : `${backendBaseUrl}${url}`);
      } catch (enhanceErr) {
        console.warn("Enhancement fallback to raw image:", enhanceErr);
        const rawUrl = uploadRes.image_url;
        setEnhancedImageUrl(rawUrl.startsWith("http") ? rawUrl : `${backendBaseUrl}${rawUrl}`);
      }

      setStatusMessage("Gemini 2.5: Crafting multilingual listings...");
      const catalogRes = await generateAICatalog(newProductId);
      setCatalogResult(catalogRes.catalog);

      setStatusMessage("AI Engine: Calculating ethical fair-trade price...");
      const priceRes = await calculateAIPricing(newProductId);
      setPricingResult(priceRes);

      setShowUpload(false);
      setGenerated(true);
      setCatalogueAdded(false);
      loadProducts();
    } catch (err: any) {
      alert(`AI Pipeline error: ${err.message || err}`);
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  const getDisplayDescription = () => {
    if (!catalogResult) return "";
    switch (selectedLanguage) {
      case "हिंदी":
        return catalogResult.hindi_description;
      case "मराठी":
        return catalogResult.marathi_description;
      case "বাংলা":
        return catalogResult.bengali_description;
      case "தமிழ்":
        return catalogResult.tamil_description;
      default:
        return catalogResult.description;
    }
  };

  const getDisplayTitle = () => {
    if (!catalogResult) return "";
    switch (selectedLanguage) {
      case "हिंदी":
        return catalogResult.hindi_title;
      case "मराठी":
        return catalogResult.marathi_title;
      case "বাংলা":
        return catalogResult.bengali_title;
      case "தமிழ்":
        return catalogResult.tamil_title;
      default:
        return catalogResult.title;
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#27231e]">
      {/* Header */}
      <header className="border-b border-black/10 bg-[#fffdf8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Shilp<span className="text-amber-700">Setu</span>
            </h1>
            <p className="text-xs text-black/50">
              Empowering Indian artisans with technology
            </p>
          </div>

          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium shadow-sm">
            Artisan Profile
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-12">
        <div className="rounded-3xl bg-[#33291f] px-7 py-10 text-white shadow-xl md:px-12">
          <div className="max-w-2xl">
            <span className="rounded-full bg-amber-400/15 px-4 py-2 text-xs font-semibold text-amber-300">
              AI-POWERED CATALOGUE
            </span>

            <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
              Turn your craft into a professional business.
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-white/65">
              Upload your handmade product and let AI create professional
              images, descriptions, translations and fair market pricing.
            </p>

            <button
              onClick={() => {
                setShowUpload(true);
                setGenerated(false);
              }}
              className="mt-7 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
            >
              + Create New Product
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 md:grid-cols-4">
        {[
          [marketplaceProducts.length.toString(), "Products in DB"],
          ["₹" + marketplaceProducts.reduce((acc, p) => acc + (p.recommended_price || 0), 0).toLocaleString(), "Catalogue Value"],
          ["5", "Languages"],
          ["AI", "Fair-Trade Pricing"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
          >
            <p className="text-2xl font-bold">{value}</p>
            <p className="mt-1 text-sm text-black/50">{label}</p>
          </div>
        ))}
      </section>

      {/* AI Generated / Selected Product Result Section */}
      {generated && catalogResult && (
        <section className="mx-auto max-w-7xl px-6 pt-12 pb-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Product Details
              </p>
              <h3 className="mt-2 text-3xl font-bold">
                {catalogResult.title} ✨
              </h3>
              <p className="mt-2 text-black/50">
                AI enhanced images, certified pricing, and regional translations.
              </p>
            </div>

            <button
              onClick={() => {
                setGenerated(false);
                setShowUpload(true);
              }}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium"
            >
              + Create Another
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Product Image */}
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
              <img
                src={enhancedImageUrl || "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=1000&q=80"}
                alt="Product"
                className="h-[420px] w-full object-contain bg-white"
              />

              <div className="flex items-center justify-between border-t border-black/10 p-5">
                <div>
                  <p className="text-xs text-black/40">AI ENHANCED IMAGE</p>
                  <p className="mt-1 font-semibold">Studio Balanced Output</p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  AI Ready
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                    Product Title ({selectedLanguage})
                  </p>
                  <h4 className="mt-2 text-2xl font-bold">
                    {getDisplayTitle()}
                  </h4>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                  AI Description
                </p>
                <p className="mt-3 leading-7 text-black/65">
                  {getDisplayDescription()}
                </p>
              </div>

              {/* Price */}
              <div className="rounded-2xl bg-[#33291f] p-6 text-white shadow-lg">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  Fair-Trade Smart Pricing
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-bold">₹{pricingResult?.recommended_price || 0}</p>
                    <p className="mt-1 text-sm text-white/50">
                      Material: ₹{pricingResult?.explanation?.material_cost || 0} | Labor: ₹{pricingResult?.explanation?.labour_cost || 0}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-400/15 px-3 py-2 text-xs font-semibold text-green-300">
                    {pricingResult?.pricing_status || "Fair Price ✓"}
                  </span>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                  Translate Catalogue
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["English", "हिंदी", "मराठी", "বাংলা", "தமிழ்"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium ${
                        selectedLanguage === lang
                          ? "bg-[#33291f] text-white"
                          : "border border-black/10 bg-white"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCatalogueAdded(true)}
                disabled={catalogueAdded}
                className={`w-full rounded-xl py-4 font-bold transition ${
                  catalogueAdded
                    ? "bg-green-500 text-white"
                    : "bg-amber-500 text-black hover:bg-amber-400"
                }`}
              >
                {catalogueAdded ? "✓ Added to Catalogue" : "📋 Confirm & Add to Marketplace"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Real Marketplace Products from Database */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
              Live Database
            </p>
            <h3 className="mt-1 text-2xl font-bold">Recent Products</h3>
          </div>

          <button onClick={loadProducts} className="text-sm font-semibold text-amber-700">
            Refresh Feed ↻
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {marketplaceProducts.length === 0 ? (
            <p className="text-sm text-black/50">No products uploaded yet. Be the first to create one!</p>
          ) : (
            marketplaceProducts.slice(0, 9).map((product) => (
              <div
                key={product.id}
                onClick={() => handleViewProduct(product)}
                className="cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={
                    product.enhanced_image_url
                      ? (product.enhanced_image_url.startsWith("http") ? product.enhanced_image_url : `${backendBaseUrl}${product.enhanced_image_url}`)
                      : product.image_url
                      ? (product.image_url.startsWith("http") ? product.image_url : `${backendBaseUrl}${product.image_url}`)
                      : "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={product.title || product.product_name}
                  className="h-52 w-full object-cover"
                />

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    {product.category || "Handicrafts"}
                  </p>

                  <h4 className="mt-2 font-semibold line-clamp-1">{product.title || product.product_name}</h4>
                  <p className="mt-1 text-xs text-black/60 line-clamp-2">{product.description || product.original_description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold">
                      ₹{product.recommended_price || 0}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(product);
                      }}
                      className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#fffdf8] p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                  New Product
                </p>
                <h3 className="mt-1 text-2xl font-bold">
                  Create your catalogue
                </h3>
              </div>

              <button
                onClick={() => setShowUpload(false)}
                disabled={loading}
                className="text-2xl text-black/40"
              >
                ×
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

           {/* Upload Clickable Area with Image Preview */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-black/15 bg-black/[0.02] p-4 text-center transition hover:border-amber-500 hover:bg-amber-500/[0.02]"
            >
              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-44 w-full rounded-xl object-contain bg-black/5"
                  />
                  <p className="mt-2 text-xs font-semibold text-black/70">
                    {selectedFile?.name}
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium">
                    Tap to change photo
                  </p>
                </div>
              ) : (
                <div className="py-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                    📸
                  </div>
                  <h4 className="mt-4 font-semibold text-sm">
                    Upload your product photo
                  </h4>
                  <p className="mt-1 text-xs text-black/45">
                    Tap here to take or select a photo
                  </p>
                  <button
                    type="button"
                    className="mt-4 rounded-xl bg-[#33291f] px-4 py-2 text-xs font-semibold text-white pointer-events-none"
                  >
                    Choose Photo
                  </button>
                </div>
              )}
            </div>
            
            {/* Form Fields */}
            <div className="mt-5 space-y-4">
              <input
                placeholder="Product name (e.g. Handmade Clay Pot)"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
              />

              {/* Description Input with Mic Button */}
              <div className="relative">
                <textarea
                  placeholder="Describe your product, or tap the mic to speak..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-black/10 bg-white p-4 pr-14 text-sm outline-none focus:border-amber-500"
                />

                <button
                  type="button"
                  onClick={toggleRecording}
                  title={isRecording ? "Stop recording" : "Speak to describe craft"}
                  className={`absolute right-3 bottom-4 flex h-10 w-10 items-center justify-center rounded-xl transition shadow-sm ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                  }`}
                >
                  {isRecording ? "⏹" : "🎤"}
                </button>
              </div>

              {recordingStatus && (
                <p className="text-xs font-semibold text-amber-700 animate-pulse">
                  {recordingStatus}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                >
                  <option value="Handicrafts">Handicrafts</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Pottery">Pottery</option>
                  <option value="Jewellery">Jewellery</option>
                  <option value="Woodwork">Woodwork</option>
                </select>

                <input
                  type="number"
                  placeholder="Material Cost (₹)"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(Number(e.target.value))}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Submission Button */}
            <button
              onClick={handleGenerateAI}
              disabled={loading || isRecording}
              className="mt-6 w-full rounded-xl bg-amber-500 py-3.5 font-bold text-black transition hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? statusMessage || "Processing with AI..." : "✨ Generate with AI"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}