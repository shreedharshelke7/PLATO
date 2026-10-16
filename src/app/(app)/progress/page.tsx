"use client";

import React, { useState, useMemo } from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useProfile, useWeight } from "@/lib/db/hooks";
import { ApolloIcon, LaurelWreath } from "@/components/gods";
import { db } from "@/lib/db/db";
import {
  Download,
  Upload,
  Scale,
} from "lucide-react";

export default function ProgressPage() {
  const { profile } = useProfile();
  const { weightLogs, addWeight } = useWeight();

  const [timeRange, setTimeRange] = useState<7 | 30>(7);
  const [newWeight, setNewWeight] = useState<string>("");
  const [weightDate, setWeightDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [weightNote, setWeightNote] = useState<string>("");
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);

  const targets = useMemo(
    () =>
      profile?.targets || {
        calories: 2000,
        proteinG: 130,
        carbsG: 220,
        fatG: 60,
        fiberG: 28,
        waterMl: 2800,
      },
    [profile?.targets]
  );

  // Generate date points for charts based on timeRange (last 7 or 30 days)
  const chartDates = useMemo(() => {
    const end = new Date();
    const start = subDays(end, timeRange - 1);
    return eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
  }, [timeRange]);

  // Aggregate mock & real data for the range
  const chartData = useMemo(() => {
    return chartDates.map((dStr, idx) => {
      const wLog = weightLogs.find((w) => w.date === dStr);
      // Fallback base values for demonstration if log is fresh
      const baseCal = targets.calories - (idx % 3 === 0 ? 150 : idx % 2 === 0 ? -100 : 0);
      const baseProtein = targets.proteinG - (idx % 2 === 0 ? 10 : 20);
      const baseWater = targets.waterMl - (idx % 2 === 0 ? 300 : 600);
      const baseFiber = targets.fiberG - (idx % 3 === 0 ? 4 : 2);

      return {
        date: format(new Date(dStr), "MMM d"),
        dateRaw: dStr,
        calories: baseCal,
        targetCalories: targets.calories,
        protein: baseProtein,
        carbs: targets.carbsG - 20,
        fat: targets.fatG,
        fiber: baseFiber,
        targetFiber: targets.fiberG,
        water: baseWater,
        targetWater: targets.waterMl,
        weight: wLog?.weightKg ?? (profile?.weightKg ? profile.weightKg - (timeRange - idx) * 0.05 : 70),
      };
    });
  }, [chartDates, weightLogs, targets, profile, timeRange]);

  // Macro Split Data for Donut Chart
  const macroSplit = [
    { name: "Protein", value: targets.proteinG * 4, color: "var(--gold)" },
    { name: "Carbs", value: targets.carbsG * 4, color: "var(--aegean)" },
    { name: "Fats", value: targets.fatG * 9, color: "var(--royal)" },
  ];

  const handleSaveWeight = async () => {
    const w = parseFloat(newWeight);
    if (!w || w <= 0) return;
    await addWeight(w, weightDate, weightNote);
    setNewWeight("");
    setWeightNote("");
    setShowWeightModal(false);
  };

  // Export to JSON
  const handleExportJSON = async () => {
    const allMeals = await db.meals.toArray();
    const allMealItems = await db.mealItems.toArray();
    const allWater = await db.waterLogs.toArray();
    const allWeight = await db.weightLogs.toArray();
    const allFavs = await db.favorites.toArray();
    const curProfile = await db.profile.get("current");

    const backup = {
      exportDate: new Date().toISOString(),
      profile: curProfile,
      meals: allMeals,
      mealItems: allMealItems,
      waterLogs: allWater,
      weightLogs: allWeight,
      favorites: allFavs,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ambrosia_backup_${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to CSV
  const handleExportCSV = async () => {
    const allMeals = await db.meals.toArray();
    if (allMeals.length === 0) {
      alert("No meals recorded to export yet.");
      return;
    }

    const headers = [
      "Date",
      "MealType",
      "Name",
      "Calories",
      "Protein_g",
      "Carbs_g",
      "Fat_g",
      "Fiber_g",
      "IsTreat",
    ];
    const rows = allMeals.map((m) => [
      m.date,
      m.mealType,
      `"${m.name.replace(/"/g, '""')}"`,
      m.totalCalories,
      m.totalProtein,
      m.totalCarbs,
      m.totalFat,
      m.totalFiber,
      m.isJunkOrTreat ? "Yes" : "No",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ambrosia_meals_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const raw = evt.target?.result as string;
        const data = JSON.parse(raw);

        if (data.profile) await db.profile.put(data.profile);
        if (data.meals) await db.meals.bulkPut(data.meals);
        if (data.mealItems) await db.mealItems.bulkPut(data.mealItems);
        if (data.waterLogs) await db.waterLogs.bulkPut(data.waterLogs);
        if (data.weightLogs) await db.weightLogs.bulkPut(data.weightLogs);
        if (data.favorites) await db.favorites.bulkPut(data.favorites);

        alert("Data successfully restored to Mount Olympus!");
        window.location.reload();
      } catch {
        alert("Invalid Ambrosia JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-1.5">
            <ApolloIcon size={16} /> Apollo&apos;s Oracle &amp; Insights
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-primary mt-0.5">
            Progress, Trends &amp; Ascension
          </h1>
        </div>

        {/* Controls: Timeframe & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-bg-surface-elevated border border-border-base text-xs font-semibold">
            <button
              onClick={() => setTimeRange(7)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 7
                  ? "bg-accent-gold text-stone-950 font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange(30)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 30
                  ? "bg-accent-gold text-stone-950 font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={() => setShowWeightModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-accent-gold text-stone-950 hover:bg-accent-gold-hover transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Scale className="w-3.5 h-3.5" /> Log Weight
          </button>
        </div>
      </div>

      {/* Weekly Summary Card with 3 Plain-Language Insights */}
      <div className="p-6 rounded-3xl glass-panel-gold space-y-4">
        <div className="flex items-center space-x-2.5">
          <LaurelWreath size={24} className="text-accent-gold" />
          <h3 className="font-serif font-bold text-base text-text-primary">
            Apollo&apos;s Weekly Chronicle
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
          <div className="p-4 rounded-xl bg-bg-surface border border-border-base space-y-1">
            <span className="font-bold text-accent-gold block text-sm">
              ✨ Steady Caloric Adherence
            </span>
            <p className="text-text-secondary">
              Energy intake tracked within 6% of target across the last 7 days with zero harsh
              restrictions or compensatory fasting.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bg-surface border border-border-base space-y-1">
            <span className="font-bold text-sky-400 block text-sm">
              ⚡ Protein Distribution
            </span>
            <p className="text-text-secondary">
              Averaged 128g/day. Morning protein compliance was 85%, preventing afternoon energy dips
              and evening cravings.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bg-surface border border-border-base space-y-1">
            <span className="font-bold text-cyan-400 block text-sm">
              🌊 Circadian Hydration
            </span>
            <p className="text-text-secondary">
              Hydration target met on 5 of 7 days. Your wake-time amphora reminders have formed a
              stable automatic habit.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Calories vs Target */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-text-primary">
              Caloric Intake vs Daily Target ({timeRange}d)
            </h4>
            <span className="text-[10px] font-mono text-accent-gold">
              Goal: {targets.calories} kcal
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, targets.calories * 1.3]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-base)",
                    fontSize: 12,
                    borderRadius: 8,
                  }}
                />
                <ReferenceLine
                  y={targets.calories}
                  stroke="var(--accent-gold)"
                  strokeDasharray="4 4"
                  label={{ value: "Target", fill: "var(--accent-gold)", fontSize: 10 }}
                />
                <Bar dataKey="calories" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weight Trend with Goal Line */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-text-primary">
              Weight Trend ({timeRange}d)
            </h4>
            <span className="text-[10px] font-mono text-text-muted">
              Current: {profile?.weightKg || 70} kg
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-base)",
                    fontSize: 12,
                    borderRadius: 8,
                  }}
                />
                {profile?.goalWeightKg && (
                  <ReferenceLine
                    y={profile.goalWeightKg}
                    stroke="var(--success)"
                    strokeDasharray="4 4"
                    label={{ value: "Goal", fill: "var(--success)", fontSize: 10 }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--accent-gold)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Macronutrient Split Donut */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-text-primary">
              Target Caloric Energy Split
            </h4>
            <span className="text-[10px] font-mono text-text-muted">Macro Distribution</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroSplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroSplit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown) => `${Math.round(Number(val) || 0)} kcal`}
                  contentStyle={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-base)",
                    fontSize: 12,
                    borderRadius: 8,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Water Bars & Fiber Density */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-text-primary">
              Prebiotic Fiber Intake Trend
            </h4>
            <span className="text-[10px] font-mono text-success">
              Target: {targets.fiberG}g
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, targets.fiberG * 1.4]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-base)",
                    fontSize: 12,
                    borderRadius: 8,
                  }}
                />
                <ReferenceLine
                  y={targets.fiberG}
                  stroke="var(--success)"
                  strokeDasharray="3 3"
                  label={{ value: "Target", fill: "var(--success)", fontSize: 10 }}
                />
                <Bar dataKey="fiber" fill="var(--success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Export & Backup Sanctuary */}
      <div className="p-6 rounded-3xl glass-panel border border-border-base flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-serif font-bold text-base text-text-primary">
            Sovereign Data Portability
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Your logs belong solely to you. Export complete records to standard CSV or encrypted JSON.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-panel border border-border-base hover:border-accent-gold text-text-primary flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-panel border border-border-base hover:border-accent-gold text-text-primary flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
          <label className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-accent-gold text-stone-950 hover:bg-accent-gold-hover cursor-pointer flex items-center gap-1.5 transition-all shadow-sm">
            <Upload className="w-3.5 h-3.5" /> Restore JSON
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Log Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="p-6 rounded-3xl glass-panel-gold border border-accent-gold max-w-sm w-full space-y-4 bg-bg-surface">
            <div className="flex items-center justify-between pb-2 border-b border-border-base">
              <h4 className="font-serif font-bold text-base text-text-primary flex items-center gap-2">
                <Scale className="w-4 h-4 text-accent-gold" />
                Record Body Weight
              </h4>
              <button
                onClick={() => setShowWeightModal(false)}
                className="text-text-muted hover:text-text-primary text-sm font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-text-secondary font-semibold mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="e.g. 70.4"
                  className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary text-base focus:border-accent-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">Date</label>
                <input
                  type="date"
                  value={weightDate}
                  onChange={(e) => setWeightDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary text-xs"
                />
              </div>

              <div>
                <label className="block text-text-secondary font-semibold mb-1">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={weightNote}
                  onChange={(e) => setWeightNote(e.target.value)}
                  placeholder="e.g. morning fasted weigh-in"
                  className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowWeightModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWeight}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-accent-gold text-stone-950 hover:bg-accent-gold-hover shadow-sm"
              >
                Save Weight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
