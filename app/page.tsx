"use client";

import { useState } from "react";

const products = [
  {
    name: "Handwoven Silk Dupatta",
    category: "Textiles",
    price: "₹1,850",
    image:
      "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Traditional Clay Pot",
    category: "Pottery",
    price: "₹750",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Handcrafted Bamboo Basket",
    category: "Handicrafts",
    price: "₹950",
    image:
          "https://img1.exportersindia.com/product_images/bc-full/2024/9/12042651/bamboo-utilitybasket-1725556901-7591976.jpeg",
  },
];

export default function Home() {
  const [showUpload, setShowUpload] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [language, setLanguage] = useState("English");
  const [generated, setGenerated] = useState(false);
  const [catalogueAdded, setCatalogueAdded] = useState(false);

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
            My Profile
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
              onClick={() => setShowUpload(true)}
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
          ["24", "Products Created"],
          ["₹42K", "Catalogue Value"],
          ["8", "Languages"],
          ["AI", "Smart Pricing"],
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

      {/* Recent Products */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
              Your Catalogue
            </p>
            <h3 className="mt-1 text-2xl font-bold">Recent Products</h3>
          </div>

          <button className="text-sm font-semibold text-amber-700">
            View all →
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.name}
              className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-52 w-full object-cover"
              />

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  {product.category}
                </p>

                <h4 className="mt-2 font-semibold">{product.name}</h4>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold">{product.price}</span>
                  <button className="rounded-lg border border-black/10 px-3 py-2 text-xs font-medium">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Result */}
{generated && (
  <section className="mx-auto max-w-7xl px-6 pb-16">
    <div className="mb-8 flex items-end justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
          AI Generated Result
        </p>
        <h3 className="mt-2 text-3xl font-bold">
          Your product is ready ✨
        </h3>
        <p className="mt-2 text-black/50">
          AI has transformed your product into a professional catalogue.
        </p>
      </div>

      <button
        onClick={() => setGenerated(false)}
        className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium"
      >
        Create Another
      </button>
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      {/* Product Image */}
      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=1000&q=80"
          alt="AI generated product"
          className="h-[420px] w-full object-cover"
        />

        <div className="flex items-center justify-between border-t border-black/10 p-5">
          <div>
            <p className="text-xs text-black/40">AI ENHANCED IMAGE</p>
            <p className="mt-1 font-semibold">Professional Product Photo</p>
          </div>

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            AI Ready
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Product Title
              </p>
              <h4 className="mt-2 text-2xl font-bold">
                Handwoven Silk Dupatta
              </h4>
            </div>

            <button className="rounded-lg border border-black/10 px-3 py-2 text-xs">
              Copy
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            AI Description
          </p>

     <p className="mt-3 leading-7 text-black/65">
  {language === "हिंदी"
    ? "यह खूबसूरत हाथ से बुना हुआ सिल्क दुपट्टा पारंपरिक भारतीय बुनाई तकनीकों से बनाया गया है। इसकी सुंदर डिजाइन, शानदार बनावट और बेहतरीन कारीगरी इसे त्योहारों, समारोहों और रोज़ाना पहनने के लिए एक बेहतरीन विकल्प बनाती है।"
    : language === "मराठी"
      ? "हा सुंदर हाताने विणलेला सिल्क दुपट्टा पारंपरिक भारतीय विणकाम तंत्राचा वापर करून तयार करण्यात आला आहे."
      : language === "বাংলা"
        ? "এই সুন্দর হাতে বোনা সিল্কের দোপাট্টাটি ঐতিহ্যবাহী ভারতীয় বয়ন কৌশল ব্যবহার করে তৈরি করা হয়েছে।"
        : language === "தமிழ்"
          ? "இந்த அழகான கையால் நெய்யப்பட்ட பட்டு துப்பட்டா பாரம்பரிய இந்திய நெசவு முறைகளைப் பயன்படுத்தி தயாரிக்கப்பட்டது."
          : "A beautifully handcrafted silk dupatta created using traditional Indian weaving techniques. Its elegant design, rich texture and detailed craftsmanship make it perfect for festive occasions, celebrations and everyday ethnic wear."}
</p>
        </div>

        {/* Price */}
        <div className="rounded-2xl bg-[#33291f] p-6 text-white shadow-lg">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
            Smart Pricing
          </p>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold">₹1,850</p>
              <p className="mt-1 text-sm text-white/50">
                Recommended market price
              </p>
            </div>

            <span className="rounded-full bg-green-400/15 px-3 py-2 text-xs font-semibold text-green-300">
              Fair Price ✓
            </span>
          </div>
        </div>

        {/* Language */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Translate Catalogue
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {["English", "हिंदी", "मराठी", "বাংলা", "தமிழ்"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                language === lang
                    ? "bg-[#33291f] text-white"
                    : "border border-black/10 bg-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Catalogue button */}
        <button
  onClick={() => setCatalogueAdded(true)}
  disabled={catalogueAdded}
  className={`w-full rounded-xl py-4 font-bold transition ${
    catalogueAdded
      ? "bg-green-500 text-white"
      : "bg-amber-500 text-black hover:bg-amber-400"
  }`}
>
  {catalogueAdded ? "✓ Added to Catalogue" : "📋 Add to Catalogue"}
</button>
      </div>
    </div>
  </section>
)}
      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#fffdf8] p-7 shadow-2xl">
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
  className="text-2xl text-black/40"
>
  ×
</button>
            </div>

            {/* Upload area */}
            <div className="mt-6 rounded-2xl border-2 border-dashed border-black/15 bg-black/[0.02] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                📸
              </div>

              <h4 className="mt-4 font-semibold">
                Upload your product photo
              </h4>

              <p className="mt-1 text-sm text-black/45">
                Take a clear photo of your handmade product
              </p>

              <button
                onClick={() => setUploaded(true)}
                className="mt-5 rounded-xl bg-[#33291f] px-5 py-3 text-sm font-semibold text-white"
              >
                {uploaded ? "✓ Photo Uploaded" : "Choose Photo"}
              </button>
            </div>

            {/* Details */}
            <div className="mt-5 space-y-4">
              <input
                placeholder="Product name"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
              />

              <textarea
                placeholder="Describe your product in your own language..."
                rows={3}
                className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"
              />

              <select className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm">
                <option>Choose category</option>
                <option>Textiles</option>
                <option>Pottery</option>
                <option>Handicrafts</option>
                <option>Jewellery</option>
                <option>Woodwork</option>
              </select>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
                <option>Bengali</option>
                <option>Tamil</option>
              </select>
            </div>

           <button
  onClick={() => {
    setShowUpload(false);
    setGenerated(true);
  }}
  className="mt-6 w-full rounded-xl bg-amber-500 py-3.5 font-bold text-black transition hover:bg-amber-400"
>
  ✨ Generate with AI
</button>
          </div>
        </div>
      )}
    </main>
  );
}