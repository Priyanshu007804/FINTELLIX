"use client";

import { motion, Variants, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Suspense, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const ParticleField = dynamic(() => import("@/components/landing/ParticleField"), {
  ssr: false,
  loading: () => null,
});

const FeatureCard3D = dynamic(() => import("@/components/landing/FeatureCard3D"), {
  ssr: false,
  loading: () => <div className="glass-card rounded-2xl p-7 h-[220px] animate-pulse" />,
});

const SafetySection = dynamic(() => import("@/components/landing/SafetySection"), {
  ssr: false,
  loading: () => <div className="h-[600px]" />,
});

const ScrollStorySection = dynamic(() => import("@/components/landing/ScrollStorySection"), {
  ssr: false,
  loading: () => <div className="h-screen" />,
});

/* ======================== DATA ======================== */

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Real-Time Analytics",
    description: "Track spending patterns with interactive charts and visualizations powered by Recharts.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Fraud Detection",
    description: "XGBoost ML model analyzes every transaction in real-time, flagging suspicious activity instantly.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Rate-Limited Security",
    description: "Enterprise-grade API protection with Upstash Redis prevents abusive transaction patterns.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: "Expense Tracking",
    description: "Categorize and monitor every transaction with detailed merchant and location metadata.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: "Stock Studio",
    description: "Manage your portfolio with live market data and deep-dive technical charts powered by yfinance.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: "AI Stock Forecast",
    description: "Leverage XGBoost intelligence to predict stock price movements with a 7-day forecasting window.",
  },
];

const stats = [
  { value: 99.9, suffix: "%", label: "Uptime" },
  { value: 50, prefix: "<", suffix: "ms", label: "API Response" },
  { value: 256, suffix: "-bit", label: "Encryption" },
  { value: 24, suffix: "/7", label: "Monitoring" },
];

const steps = [
  {
    number: "01",
    title: "Add Transaction",
    description: "Log your expenses with merchant, amount, and category data.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "ML Analysis",
    description: "Our XGBoost model analyzes transactions for fraud and predicts stock trends in real-time.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Instant Alert",
    description: "Fraud flagged? You get a real-time dashboard alert + email notification.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Multi-Device Sync",
    description: "WebSocket-powered updates reflect across all your devices instantly.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
      </svg>
    ),
  },
];


/* ======================== ANIMATIONS ======================== */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};


/* ======================== COUNTER COMPONENT ======================== */

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = value / totalSteps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref} className="animate-counter-glow">
      {prefix}{count}{suffix}
    </span>
  );
}

/* ======================== MAIN PAGE ======================== */

export default function LandingPage() {
  const { data: session, isPending } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-sky-500/3 blur-[100px]" />
      </div>

      {/* ===== NAVIGATION (Frosted Glass on Scroll) ===== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 py-4 transition-all duration-300 ${
          scrolled
            ? "nav-frosted border-b border-slate-800/60 shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <Image src="/Logo.jpeg" alt="Fintellix" width={40} height={40} className="rounded-lg object-contain" />
          <span className="text-xl font-bold tracking-tight">Fintellix</span>
        </div>
        <div className="flex items-center gap-4">
          {!isPending && session ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-cyan-500 text-[#020617] hover:bg-cyan-400 transition animate-glow-pulse"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-cyan-500 text-[#020617] hover:bg-cyan-400 transition animate-glow-pulse"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex items-center justify-center pt-20">
        {/* Three.js Particle Background */}
        <Suspense fallback={null}>
          <ParticleField />
        </Suspense>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-slate-700 bg-slate-800/40 text-xs font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Powered by Machine Learning
            </div>
          </motion.div>

          {/* Staggered hero text */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight"
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="block"
            >
              Intelligent Finance.
            </motion.span>
            <motion.span
              variants={fadeUp}
              custom={1}
              className="block bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent"
            >
              Zero Fraud.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Fintellix combines real-time expense tracking with AI-driven fraud detection
            to give you complete control over your finances — securely and intelligently.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="group relative w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-500 text-[#020617] font-semibold text-base hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20 animate-glow-pulse"
            >
              Start Tracking Free
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-medium text-base hover:bg-slate-800/60 hover:border-slate-600 transition"
            >
              Learn More
            </a>
          </motion.div>

          {/* Animated Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-2.5 rounded-full bg-cyan-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-3">
            Features
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to stay secure
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-slate-400 max-w-xl mx-auto">
            From intelligent analytics to enterprise-grade security, Fintellix is built for the modern financial landscape.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: "1200px" }}>
          {features.map((feature, i) => (
            <FeatureCard3D
              key={i}
              index={i}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-3">
            How It Works
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold tracking-tight">
            From transaction to protection in milliseconds
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[60px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-cyan-500/30 via-violet-500/30 to-cyan-500/30 animate-line-pulse" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="relative text-center"
            >
              {/* Step circle */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="mx-auto w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-slate-700/50 flex items-center justify-center mb-5 relative z-10"
              >
                <div className="text-cyan-400">
                  {step.icon}
                </div>
              </motion.div>

              <p className="text-xs font-bold text-cyan-400/60 mb-1">{step.number}</p>
              <h3 className="text-base font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== SCROLL STORY SECTION ===== */}
      <ScrollStorySection />

      {/* ===== STAY SAFE SECTION ===== */}
      <SafetySection />



      {/* ===== CTA SECTION ===== */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="gradient-border-wrapper">
            <div className="rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#020617] p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Ready to take control of your finances?
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8">
                Join Fintellix today and experience intelligent expense tracking with
                AI-powered fraud detection — completely free.
              </p>
              <Link
                href="/login"
                className="inline-flex px-8 py-3.5 rounded-xl bg-cyan-500 text-[#020617] font-semibold text-base hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20 animate-glow-pulse"
              >
                Get Started — It&apos;s Free →
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-slate-800/60 px-6 md:px-12 lg:px-20 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/Logo.jpeg" alt="Fintellix" width={28} height={28} className="rounded-md object-contain" />
            <span className="text-sm font-semibold text-slate-400">Fintellix</span>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Fintellix. Built with Next.js, BetterAuth & Drizzle ORM.
          </p>
        </div>
      </footer>
    </div>
  );
}
