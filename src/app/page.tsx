"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

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
    description: "AI-powered transaction analysis flags suspicious activity before it impacts your finances.",
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
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "<50ms", label: "API Response" },
  { value: "256-bit", label: "Encryption" },
  { value: "24/7", label: "Monitoring" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  const { data: session, isPending } = useSession();

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <Image src="/Logo.jpeg" alt="Fintellix" width={44} height={44} className="rounded-lg object-contain" />
          <span className="text-xl font-bold tracking-tight">Fintellix</span>
        </div>
        <div className="flex items-center gap-4">
          {!isPending && session ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-cyan-500 text-[#020617] hover:bg-cyan-400 transition"
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
                className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-cyan-500 text-[#020617] hover:bg-cyan-400 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-slate-700 bg-slate-800/40 text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Powered by Machine Learning
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Intelligent Finance.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              Zero Fraud.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Fintellix combines real-time expense tracking with AI-driven fraud detection
            to give you complete control over your finances — securely and intelligently.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-500 text-[#020617] font-semibold text-base hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
            >
              Start Tracking Free →
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-medium text-base hover:bg-slate-800 transition"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20">
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

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i}
              className="group rounded-2xl border border-slate-800 bg-[#0f172a]/60 p-7 hover:border-slate-700 hover:bg-[#0f172a] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0f172a] to-[#020617] p-10 md:p-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">
            Join Fintellix today and experience intelligent expense tracking with
            AI-powered fraud detection — completely free.
          </p>
          <Link
            href="/login"
            className="inline-flex px-8 py-3.5 rounded-xl bg-cyan-500 text-[#020617] font-semibold text-base hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
          >
            Get Started — It&apos;s Free →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
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
