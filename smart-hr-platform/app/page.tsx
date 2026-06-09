"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LogIn,
  ShieldCheck,
  Users,
  CalendarDays,
  ArrowRight,
  Sun,
  Moon,
  Languages,
} from "lucide-react";

// 🚀 อิมพอร์ตคำแปลจากโฟลเดอร์ locale ส่วนกลาง
import th from "@/locale/th.json";
import en from "@/locale/en.json";

const translations = { TH: th, EN: en };

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<"TH" | "EN">("TH");
  const [mounted, setMounted] = useState(false);

  // ดึงข้อมูลคำแปลตามภาษาที่เลือก
  const t = translations[lang];

  useEffect(() => {
    const savedTheme = localStorage.getItem("dashboard_theme");
    const savedLang = localStorage.getItem("dashboard_lang");

    const timer = setTimeout(() => {
      if (savedTheme === "dark") {
        setIsDarkMode(true);
      }
      if (savedLang === "EN" || savedLang === "TH") {
        setLang(savedLang as "TH" | "EN");
      }
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const root = document.documentElement;
    root.classList.toggle("dark", isDarkMode);
    root.style.colorScheme = isDarkMode ? "dark" : "light";
  }, [isDarkMode, mounted]);

  const toggleDarkMode = () => {
    const nextTheme = !isDarkMode ? "dark" : "light";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("dashboard_theme", nextTheme);
  };

  const toggleLanguage = () => {
    const nextLang = lang === "TH" ? "EN" : "TH";
    setLang(nextLang);
    localStorage.setItem("dashboard_lang", nextLang);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300 bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 overflow-hidden relative">
      {/* 🌌 แอนิเมชันพื้นหลัง: วงกลมเรืองแสงฟุ้งๆ ค่อยๆ ขยับสลัวๆ (Ambient Backlights) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] animate-pulse duration-[8000ms] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[130px] animate-pulse duration-[10000ms] pointer-events-none" />

      {/* 🧭 Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 font-black text-xl text-blue-600 tracking-tight dark:text-blue-500 group cursor-pointer">
          <ShieldCheck className="w-6 h-6 transition-transform group-hover:scale-110" />
          <span>
            Smart<span className="text-slate-800 dark:text-slate-200">HR</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* ปุ่มสลับภาษา */}
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
          >
            <Languages className="w-3.5 h-3.5 text-blue-500" />
            <span>{lang === "TH" ? "EN" : "TH"}</span>
          </button>

          {/* ปุ่มสลับธีม Dark / Light */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* ปุ่มเข้าสู่ระบบส่วนหัว */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <LogIn className="w-4 h-4 opacity-80" />
            {t.loginBtn}
          </Link>
        </div>
      </header>

      {/* 🚀 Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center py-16 relative z-10">
        {/* ป้ายสติกเกอร์เก๋ๆ แบบมีขอบสะท้อนแสง */}
        <div className="inline-flex items-center gap-1.5 bg-blue-50/80 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-blue-100 shadow-sm dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          {t.badge}
        </div>

        {/* พาดหัวใหญ่เอฟเฟกต์สีไล่ระดับ Gradient */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.15] max-w-4xl">
          {t.heroTitle1} <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-pulse dark:from-blue-400 dark:to-indigo-400">
            {t.heroTitle2}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
          {t.heroDesc}
        </p>

        {/* ปุ่มเริ่มงานใหญ่ทรงพลัง */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.03] transition-all active:scale-95 group text-sm sm:text-base"
          >
            {t.ctaBtn}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 🛠️ Features Grid ที่เพิ่ม Hover Lift Effect ขยับยกตัวกล่องเรียบหรู */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mt-24 text-left">
          {/* การ์ดที่ 1 */}
          <div className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-800/80 dark:border-slate-700/60 hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:scale-[1.02] hover:shadow-md transition-all duration-300 backdrop-blur-sm">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-2 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {t.feat1Title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.feat1Desc}
            </p>
          </div>

          {/* การ์ดที่ 2 */}
          <div className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-800/80 dark:border-slate-700/60 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:scale-[1.02] hover:shadow-md transition-all duration-300 backdrop-blur-sm">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-2 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {t.feat2Title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.feat2Desc}
            </p>
          </div>

          {/* การ์ดที่ 3 */}
          <div className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-800/80 dark:border-slate-700/60 hover:border-purple-500/30 dark:hover:border-purple-500/30 hover:scale-[1.02] hover:shadow-md transition-all duration-300 backdrop-blur-sm">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-2 transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
              {t.feat3Title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.feat3Desc}
            </p>
          </div>
        </div>
      </main>

      {/* 📝 Footer */}
      <footer className="w-full text-center py-6 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 relative z-10">
        © 2026 SmartHR Platform. All rights reserved.
      </footer>
    </div>
  );
}
