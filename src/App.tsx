/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, ArrowUpRight, MoreHorizontal, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PinterestResult {
  id: string;
  image: string;
  caption: string;
  source: string;
  uploader: string;
}

interface PinterestApiResponse {
  author: string;
  result: PinterestResult[];
}

const DEFAULT_QUERY = '';
const API_KEY = 'exs_pooopp_f477b967';

export default function App() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [searchInput, setSearchInput] = useState(DEFAULT_QUERY);
  const [results, setResults] = useState<PinterestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState('https://cdn-icons-png.flaticon.com/512/145/145808.png');
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    // Fetch custom logo from server on mount
    fetch('/api/logo')
      .then(res => res.json())
      .then(data => {
        if (data.logo) {
          setLogoUrl(data.logo);
        }
      })
      .catch(err => console.error("Failed to load logo:", err));
  }, []);

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      try {
        const response = await fetch(`/api/search/pinterest?query=${encodeURIComponent(query)}&apikey=${API_KEY}`);
        const data: PinterestApiResponse = await response.json();
        
        if (data.result && data.result.length > 0) {
          setResults(data.result);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Gagal mengambil data dari server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() === '#logo') {
      setShowSecretModal(true);
      setSearchInput(query); // revert search input
      return;
    }
    if (searchInput.trim()) {
      setQuery(searchInput.trim());
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setUploadingLogo(true);
      try {
        const res = await fetch('/api/logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logo: base64String }),
        });
        if (res.ok) {
          setLogoUrl(base64String);
          setShowSecretModal(false);
        } else {
          alert('Gagal menyimpan logo.');
        }
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan.');
      } finally {
        setUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#111015] flex flex-col items-center font-sans text-gray-100">
      {/* Search Bar Container */}
      <div className="w-full max-w-xl mt-8 px-6 mb-8 flex items-center gap-3">
        {/* Gambar di luar kolom pencarian (lebih kecil) */}
        <img 
          src={logoUrl} 
          alt="logo" 
          className="w-7 h-7 rounded-full shrink-0 object-contain"
          referrerPolicy="no-referrer"
        />
        
        {/* Kolom Pencarian (lebih ramping) */}
        <div className="flex-1 flex items-center px-4 py-2 rounded-full bg-[#202124] border border-transparent focus-within:border-[#3c4043] focus-within:shadow-xl transition-all shadow-md">
          <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Telusuri..."
              className="w-full bg-transparent border-none outline-none text-gray-100 text-base flex-1"
              id="google-search-input"
            />
          </form>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-4 lg:px-8 py-2 pb-24">
        {loading && (
          <div className="w-full flex justify-center py-20">
            <motion.img
              src="https://static.vecteezy.com/system/resources/thumbnails/055/687/065/small_2x/gemini-google-icon-symbol-logo-free-png.png"
              alt="Loading"
              className="h-12 w-12 object-contain"
              animate={{ rotate: [0, 180, 180, 360, 360] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.4, 0.5, 0.9, 1]
              }}
            />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && results.length === 0 && !query && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Temukan inspirasi Anda.</p>
            <p className="text-sm mt-2">Mulai mencari dengan mengetik kata kunci di kolom pencarian.</p>
          </div>
        )}

        {!loading && !error && results.length === 0 && query && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Tidak ada hasil ditemukan untuk "{query}"</p>
            <p className="text-sm mt-2">Coba gunakan kata kunci lain.</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4">
            <AnimatePresence>
              {results.map((item, i) => (
                <PinterestCard key={item.id} result={item} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Secret Logo Modal */}
      <AnimatePresence>
        {showSecretModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#202124] p-6 rounded-2xl max-w-sm w-full border border-[#3c4043] shadow-2xl"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Ganti Logo</h2>
              <p className="text-sm text-gray-400 mb-6">
                Unggah gambar untuk mengganti logo default. Gambar akan disimpan di server.
              </p>
              
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-center w-full h-32 px-4 transition bg-[#111015] border-2 border-dashed border-[#3c4043] rounded-xl cursor-pointer hover:border-gray-400">
                  <span className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="font-medium text-gray-400">
                      {uploadingLogo ? 'Mengunggah...' : 'Pilih Gambar'}
                    </span>
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
                
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setShowSecretModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Separate component for Card to manage image loading states and hover effects
function PinterestCard({ result, index }: { result: PinterestResult; index: number; key?: React.Key }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
      className="break-inside-avoid relative group inline-block w-full cursor-pointer mb-4"
    >
      {/* Image Container with aspect ratio preservation concept */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#202124]">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-[#3c4043] animate-pulse rounded-2xl"></div>
        )}
        <img
          src={result.image}
          alt={result.caption || "Pinterest image"}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-auto object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 rounded-2xl pointer-events-none">
          {/* Top Actions */}
          <div className="flex justify-end w-full">
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 text-sm rounded-full pointer-events-auto transition-colors transform scale-100 active:scale-95 shadow-md">
              Simpan
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-between items-center w-full gap-2">
            {/* Link */}
            {result.source && (
              <a
                href={result.source}
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto bg-[#202124]/90 hover:bg-[#3c4043] text-gray-200 text-xs font-semibold py-1.5 px-3 rounded-full flex items-center gap-1.5 max-w-[60%] backdrop-blur-sm transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span className="truncate">Tautan</span>
              </a>
            )}
            
            <div className="flex gap-2">
              <button className="pointer-events-auto bg-[#202124]/90 hover:bg-[#3c4043] p-2 rounded-full text-gray-200 backdrop-blur-sm transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button className="pointer-events-auto bg-[#202124]/90 hover:bg-[#3c4043] p-2 rounded-full text-gray-200 backdrop-blur-sm transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Below Image */}
      {imgLoaded && (
        <div className="mt-2 px-1">
          {result.caption && result.caption.trim() && (
            <h3 className="text-sm font-medium text-gray-200 line-clamp-2 mb-1">
              {result.caption}
            </h3>
          )}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 rounded-full bg-[#3c4043] flex items-center justify-center shrink-0 overflow-hidden text-gray-300 font-medium text-xs">
              {result.uploader?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-xs text-gray-400 font-medium truncate hover:underline">
              {result.uploader || 'Unknown uploader'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}


