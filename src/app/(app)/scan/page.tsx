"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useMeals, useSettings } from "@/lib/db/hooks";
import { DBMealItem, MealType } from "@/lib/db/db";
import { compressAndResizeImage } from "@/lib/utils/imageCompression";
import { searchLocalFoods, FoodItem } from "@/data/foods";
import { scaleNutrients } from "@/lib/nutrition/targets";
import { DemeterIcon } from "@/components/gods";
import {
  Camera,
  Barcode,
  Search,
  Upload,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Loader2,
  Key,
} from "lucide-react";

interface ApiScanItem {
  name: string;
  portion?: {
    amount?: number;
    unit?: string;
    grams?: number;
  };
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  confidence?: number;
}

interface ApiParsedItem {
  name: string;
  portionAmount: number;
  portionUnit: string;
  grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

type ScanTab = "photo" | "barcode" | "search";

function getMealTypeFromTime(): MealType {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 19) return "snack";
  return "dinner";
}

function MealScannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [todayStr, setTodayStr] = useState<string>("");
  const { addMeal } = useMeals(todayStr);
  const { settings, updateSettings } = useSettings();

  const [activeTab, setActiveTab] = useState<ScanTab>("photo");
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    (searchParams.get("mealType") as MealType) || "lunch"
  );

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
    if (!searchParams.get("mealType")) {
      setSelectedMealType(getMealTypeFromTime());
    }
  }, [searchParams]);

  // Editable Meal Items (Human in the loop)
  const [dishName, setDishName] = useState<string>("Harvest Feast");
  const [items, setItems] = useState<Omit<DBMealItem, "id" | "mealId">[]>([]);
  const [scanNotes, setScanNotes] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // API Key prompt if not configured
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>("");
  const [isVerifyingScanKey, setIsVerifyingScanKey] = useState<boolean>(false);
  const [scanKeyError, setScanKeyError] = useState<string | null>(null);

  // Live Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Barcode scanner
  const barcodeVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isScanningBarcode, setIsScanningBarcode] = useState<boolean>(false);
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [freeTextMeal, setFreeTextMeal] = useState("");
  const searchResults = searchLocalFoods(searchQuery, 15);


  // --- PHOTO SCANNING ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const startLiveCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      setCameraError(
        "Camera permission was denied or camera is unavailable. Use file upload or camera capture below."
      );
    }
  };

  const stopLiveCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureLivePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        stopLiveCamera();
        await processImageFile(blob);
      }
    }, "image/jpeg", 0.85);
  };

  const processImageFile = async (file: File | Blob) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // 1. Client-side compress and resize (max 1024px, 0.8 quality)
      const compressed = await compressAndResizeImage(file, 1024, 0.8);

      // 2. Prepare headers (including user key if set)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (settings.userApiKey) {
        headers["x-user-key"] = settings.userApiKey;
      }

      // 3. POST to /api/scan
      const res = await fetch("/api/scan", {
        method: "POST",
        headers,
        body: JSON.stringify({
          imageBase64: compressed.base64,
          mimeType: compressed.mimeType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "AI_NOT_CONFIGURED" || data.code === "INVALID_API_KEY") {
          setShowKeyInput(true);
        }
        throw new Error(data.error || "Analysis failed");
      }

      // Populate Human-in-the-loop items
      setDishName(data.dishName || "Analyzed Plate");
      setScanNotes(data.notes || "");

      const formattedItems: Omit<DBMealItem, "id" | "mealId">[] = (data.items || []).map(
        (item: ApiScanItem) => ({
          name: item.name,
          portionAmount: item.portion?.amount || 1,
          portionUnit: item.portion?.unit || "serving",
          grams: item.portion?.grams || 100,
          calories: item.calories,
          protein_g: item.protein_g,
          carbs_g: item.carbs_g,
          fat_g: item.fat_g,
          fiber_g: item.fiber_g,
          confidence: item.confidence || 0.85,
          source: "scanner",
        })
      );

      setItems(formattedItems);

      if (formattedItems.length === 0 && data.notes) {
        setErrorMessage(data.notes);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error analyzing plate");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scannerControlsRef = useRef<{ stop: () => void } | null>(null);

  // --- BARCODE SCANNING ---
  const startBarcodeScanner = async () => {
    setIsScanningBarcode(true);
    setErrorMessage(null);
    try {
      const codeReader = new BrowserMultiFormatReader();
      if (barcodeVideoRef.current) {
        const controls = await codeReader.decodeFromVideoDevice(
          undefined,
          barcodeVideoRef.current,
          (result) => {
            if (result) {
              const code = result.getText();
              controls.stop();
              scannerControlsRef.current = null;
              setIsScanningBarcode(false);
              lookupBarcode(code);
            }
          }
        );
        scannerControlsRef.current = controls;
      }
    } catch {
      setErrorMessage("Barcode camera access failed. You can search manually.");
      setIsScanningBarcode(false);
    }
  };

  const stopBarcodeScanner = () => {
    if (scannerControlsRef.current) {
      scannerControlsRef.current.stop();
      scannerControlsRef.current = null;
    }
    setIsScanningBarcode(false);
  };

  const lookupBarcode = async (code: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok || !data.found) {
        throw new Error(data.message || `Barcode ${code} not found in database.`);
      }

      setDishName(data.name);
      setItems([
        {
          name: `${data.name} ${data.brand ? `(${data.brand})` : ""}`,
          portionAmount: 1,
          portionUnit: data.servingSizeStr || "1 serving",
          grams: data.servingGrams || 100,
          calories: data.per100g.calories,
          protein_g: data.per100g.protein_g,
          carbs_g: data.per100g.carbs_g,
          fat_g: data.per100g.fat_g,
          fiber_g: data.per100g.fiber_g,
          confidence: 1.0,
          source: "barcode",
        },
      ]);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Barcode lookup failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- SEARCH & NATURAL LANGUAGE NLP ---
  const handleParseFreeText = async () => {
    if (!freeTextMeal.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (settings.userApiKey) headers["x-user-key"] = settings.userApiKey;

      const res = await fetch("/api/parse-meal", {
        method: "POST",
        headers,
        body: JSON.stringify({ text: freeTextMeal }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to parse text");

      setDishName(data.dishName || freeTextMeal);
      const parsedItems = (data.items || []).map((item: ApiParsedItem) => ({
        ...item,
        confidence: 0.9,
        source: "manual" as const,
      }));
      setItems((prev) => [...prev, ...parsedItems]);
      setFreeTextMeal("");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "NLP parsing error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addFoodFromDatabase = (food: FoodItem) => {
    setItems((prev) => [
      ...prev,
      {
        name: food.name,
        portionAmount: 1,
        portionUnit: food.servingUnit,
        grams: food.servingGrams,
        calories: food.perServing.calories,
        protein_g: food.perServing.protein_g,
        carbs_g: food.perServing.carbs_g,
        fat_g: food.perServing.fat_g,
        fiber_g: food.perServing.fiber_g,
        confidence: 1.0,
        source: "database",
      },
    ]);
  };

  // Human in the Loop: Adjust quantity
  const updateItemPortion = (index: number, newPortion: number) => {
    if (newPortion <= 0) return;
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const ratio = newPortion / Math.max(0.1, item.portionAmount);
      updated[index] = {
        ...scaleNutrients(item, ratio),
        portionAmount: Number(newPortion.toFixed(1)),
        grams: Math.round(item.grams * ratio),
      };
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Log meal
  const handleSaveAndLog = async () => {
    if (items.length === 0) {
      alert("Please add at least one food item before logging.");
      return;
    }

    await addMeal({
      mealType: selectedMealType,
      name: dishName || `${selectedMealType} Feast`,
      items,
    });

    router.push("/dashboard");
  };

  const saveCustomApiKey = async () => {
    const key = tempApiKey.trim();
    if (!key) return;
    setIsVerifyingScanKey(true);
    setScanKeyError(null);

    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-key": key,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify key with Gemini API");
      }

      await updateSettings({ userApiKey: key });
      setShowKeyInput(false);
      setErrorMessage(null);
      alert("Your Gemini API key has been verified and securely saved in local IndexedDB!");
    } catch (err: unknown) {
      setScanKeyError(err instanceof Error ? err.message : "Error verifying key");
    } finally {
      setIsVerifyingScanKey(false);
    }
  };

  // Totals of currently scanned meal
  const mealTotalCalories = items.reduce((s, i) => s + i.calories, 0);
  const mealTotalProtein = Number(items.reduce((s, i) => s + i.protein_g, 0).toFixed(1));
  const mealTotalCarbs = Number(items.reduce((s, i) => s + i.carbs_g, 0).toFixed(1));
  const mealTotalFat = Number(items.reduce((s, i) => s + i.fat_g, 0).toFixed(1));
  const mealTotalFiber = Number(items.reduce((s, i) => s + i.fiber_g, 0).toFixed(1));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-gold font-semibold flex items-center gap-1.5">
            <DemeterIcon size={16} /> Demeter Food Altar
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-primary mt-0.5">
            Scan & Chronicle Fuel
          </h1>
        </div>

        {/* Meal Type Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-surface-elevated border border-border-base text-xs font-semibold">
          {(["breakfast", "lunch", "snack", "dinner"] as MealType[]).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedMealType(t)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                selectedMealType === t
                  ? "bg-accent-gold text-stone-950 font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-base">
        <button
          onClick={() => {
            stopLiveCamera();
            setActiveTab("photo");
          }}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "photo"
              ? "border-accent-gold text-accent-gold"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <Camera className="w-4 h-4" /> Photo Vision
        </button>
        <button
          onClick={() => {
            stopLiveCamera();
            setActiveTab("barcode");
          }}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "barcode"
              ? "border-accent-gold text-accent-gold"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <Barcode className="w-4 h-4" /> Barcode Scan
        </button>
        <button
          onClick={() => {
            stopLiveCamera();
            setActiveTab("search");
          }}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "search"
              ? "border-accent-gold text-accent-gold"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <Search className="w-4 h-4" /> Search & Type
        </button>
      </div>

      {/* API Key Modal / Helper if needed */}
      {showKeyInput && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Key className="w-4 h-4" /> Add Your Gemini Key to Enable AI Vision
          </div>
          <p className="text-text-secondary leading-relaxed">
            AI photo scanning requires a Gemini API key. You can provide your free personal key below
            (stored locally on your device in IndexedDB and sent via header) or use our bundled
            120+ food database under the <strong>Search & Type</strong> tab without any key.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter AI Studio Gemini API Key"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary focus:border-accent-gold"
            />
            <button
              onClick={saveCustomApiKey}
              disabled={isVerifyingScanKey}
              className="px-4 py-2 bg-accent-gold text-stone-950 font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isVerifyingScanKey ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                </>
              ) : (
                "Save Key"
              )}
            </button>
          </div>
          {scanKeyError && (
            <p className="text-red-400 text-xs font-medium">{scanKeyError}</p>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: PHOTO SCAN */}
      {activeTab === "photo" && (
        <div className="p-6 rounded-3xl glass-panel space-y-6">
          {/* Live Camera View if active */}
          {isCameraActive ? (
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
              <div className="absolute bottom-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={captureLivePhoto}
                  className="px-6 py-2.5 rounded-full bg-accent-gold text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95"
                >
                  <Camera className="w-4 h-4" /> Snap Photo
                </button>
                <button
                  type="button"
                  onClick={stopLiveCamera}
                  className="px-4 py-2.5 rounded-full bg-stone-900/80 text-text-primary text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Reliable Path: File / Camera input */}
              <label className="p-8 rounded-2xl border-2 border-dashed border-accent-gold/40 hover:border-accent-gold bg-bg-surface flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-accent-gold/5 group">
                <div className="w-12 h-12 rounded-full bg-accent-gold/15 flex items-center justify-center text-accent-gold mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="font-serif font-bold text-sm text-text-primary">
                  Choose Photo / Camera
                </span>
                <span className="text-xs text-text-muted mt-1">
                  Upload meal plate or use device camera
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Live Web Camera */}
              <button
                type="button"
                onClick={startLiveCamera}
                className="p-8 rounded-2xl border-2 border-dashed border-border-base hover:border-accent-gold bg-bg-surface flex flex-col items-center justify-center text-center transition-all hover:bg-accent-gold/5 group"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-500/15 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="font-serif font-bold text-sm text-text-primary">
                  Launch Live Camera
                </span>
                <span className="text-xs text-text-muted mt-1">
                  Direct webcam / mobile viewfinder
                </span>
              </button>
            </div>
          )}

          {cameraError && (
            <p className="text-xs text-amber-400 text-center">{cameraError}</p>
          )}

          {isAnalyzing && (
            <div className="p-6 rounded-2xl glass-panel-gold text-center space-y-3">
              <Loader2 className="w-8 h-8 text-accent-gold animate-spin mx-auto" />
              <div className="font-serif font-bold text-sm text-text-primary">
                Demeter Analyzing Plate with Gemini Vision...
              </div>
              <p className="text-xs text-text-secondary">
                Estimating katori portions, whole wheat rotis, and macro density.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BARCODE SCAN */}
      {activeTab === "barcode" && (
        <div className="p-6 rounded-3xl glass-panel space-y-6">
          <div className="text-center max-w-md mx-auto space-y-2">
            <h3 className="font-serif font-bold text-lg text-text-primary">
              Barcode Transmutation
            </h3>
            <p className="text-xs text-text-secondary">
              Instant nutrition lookup powered by Open Food Facts (over 3 million packaged products).
            </p>
          </div>

          {isScanningBarcode ? (
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center">
              <video ref={barcodeVideoRef} className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-accent-gold/60 pointer-events-none m-8 rounded-xl" />
              <button
                onClick={stopBarcodeScanner}
                className="absolute bottom-4 px-4 py-2 rounded-full bg-stone-900/80 text-xs font-semibold text-text-primary"
              >
                Stop Scanner
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <button
                onClick={startBarcodeScanner}
                className="px-6 py-3 rounded-xl bg-accent-gold text-stone-950 font-bold text-sm flex items-center gap-2 hover:bg-accent-gold-hover transition-all shadow-md active:scale-95"
              >
                <Barcode className="w-5 h-5" /> Open Barcode Viewfinder
              </button>
              <span className="text-xs text-text-muted">Or enter barcode numbers manually:</span>
              <div className="flex gap-2 w-full max-w-sm">
                <input
                  type="text"
                  placeholder="e.g. 8901491101838"
                  value={barcodeResult || ""}
                  onChange={(e) => setBarcodeResult(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-xs text-text-primary focus:border-accent-gold"
                />
                <button
                  onClick={() => barcodeResult && lookupBarcode(barcodeResult)}
                  className="px-4 py-2 rounded-xl bg-accent-gold text-stone-950 font-bold text-xs"
                >
                  Lookup
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SEARCH & TYPE */}
      {activeTab === "search" && (
        <div className="p-6 rounded-3xl glass-panel space-y-6">
          {/* Natural Language Free Text Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Describe in Natural Language (Offline Supported)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 2 rotis and a katori dal with butter chicken"
                value={freeTextMeal}
                onChange={(e) => setFreeTextMeal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleParseFreeText();
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-bg-surface border border-border-base text-text-primary text-sm focus:border-accent-gold"
              />
              <button
                type="button"
                onClick={handleParseFreeText}
                className="px-5 py-2.5 rounded-xl bg-accent-gold text-stone-950 font-bold text-xs shrink-0"
              >
                Parse Meal
              </button>
            </div>
          </div>

          {/* Database Search */}
          <div className="space-y-3 pt-4 border-t border-border-base">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Or Pick from 120+ Bundled Indian & Global Staples
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search roti, dal, poha, paneer, eggs, oats, thali..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-surface border border-border-base text-text-primary text-sm focus:border-accent-gold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {searchResults.map((food) => (
                <div
                  key={food.id}
                  onClick={() => addFoodFromDatabase(food)}
                  className="p-3 rounded-xl bg-bg-surface-elevated border border-border-base hover:border-accent-gold flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
                >
                  <div>
                    <div className="font-semibold text-xs text-text-primary">{food.name}</div>
                    <div className="text-[10px] text-text-muted mt-0.5 font-mono">
                      {food.perServing.calories} kcal • {food.perServing.protein_g}g P ({food.servingUnit})
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-accent-gold" />
                </div>
              ))}
            </div>
            <div className="text-[11px] text-text-muted">
              * Nutrients sourced from IFCT / USDA standards. Values marked approx.
            </div>
          </div>
        </div>
      )}

      {/* HUMAN IN THE LOOP: EDITABLE MEAL BREAKDOWN */}
      {items.length > 0 && (
        <div className="p-6 rounded-3xl glass-panel-gold space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-base">
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="font-serif font-black text-xl text-text-primary bg-transparent border-b border-accent-gold/40 focus:outline-none"
                />
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-gold/20 text-accent-gold uppercase font-mono">
                  AI Estimate
                </span>
              </div>
              {scanNotes && (
                <p className="text-xs text-text-secondary mt-1">{scanNotes}</p>
              )}
            </div>

            <div className="text-right sm:text-right">
              <span className="font-serif font-black text-2xl text-accent-gold block">
                {mealTotalCalories} kcal
              </span>
              <span className="text-xs text-text-muted font-mono">
                {mealTotalProtein}g P • {mealTotalCarbs}g C • {mealTotalFat}g F • {mealTotalFiber}g Fiber
              </span>
            </div>
          </div>

          {/* Item List */}
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-bg-surface-elevated border border-border-base flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1">
                  <div className="font-bold text-sm text-text-primary">{item.name}</div>
                  <div className="text-text-muted font-mono mt-0.5">
                    {item.calories} kcal • {item.protein_g}g P • {item.carbs_g}g C • {item.fat_g}g F • {item.fiber_g}g Fiber
                  </div>
                </div>

                {/* Portion controls */}
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-[11px]">{item.portionUnit}:</span>
                  <div className="flex items-center border border-border-base rounded-lg overflow-hidden bg-bg-surface">
                    <button
                      type="button"
                      onClick={() => updateItemPortion(idx, item.portionAmount - 0.5)}
                      className="px-2.5 py-1 text-sm font-bold text-text-secondary hover:bg-accent-gold hover:text-stone-950"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-mono font-bold text-text-primary text-xs">
                      {item.portionAmount}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateItemPortion(idx, item.portionAmount + 0.5)}
                      className="px-2.5 py-1 text-sm font-bold text-text-secondary hover:bg-accent-gold hover:text-stone-950"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1.5 text-text-muted hover:text-red-400 transition-colors ml-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border-base">
            <button
              type="button"
              onClick={() => setItems([])}
              className="text-xs font-semibold text-text-muted hover:text-text-primary"
            >
              Clear Scanned Items
            </button>
            <button
              type="button"
              onClick={handleSaveAndLog}
              className="px-8 py-3 rounded-xl font-bold bg-accent-gold hover:bg-accent-gold-hover text-stone-950 text-sm flex items-center gap-2 shadow-lg shadow-accent-gold/25 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" /> Log to {selectedMealType.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MealScannerPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
        </div>
      }
    >
      <MealScannerContent />
    </React.Suspense>
  );
}
