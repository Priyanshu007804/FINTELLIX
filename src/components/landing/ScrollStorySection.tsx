"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ======================================================
   MOBILE FALLBACK — lightweight vertical timeline
   ====================================================== */

function MobileFallback() {
  const steps = [
    {
      icon: (
        <svg className="h-8 w-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      label: "Transaction Initiated",
      sub: "₹12,499 · Amazon India",
    },
    {
      icon: (
        <svg className="h-8 w-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      label: "Data Transmitted",
      sub: "Encrypted payload sent to AI",
    },
    {
      icon: (
        <svg className="h-8 w-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      label: "AI Scanning",
      sub: "30+ fraud signals analyzed",
    },
    {
      icon: (
        <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
      label: "Transaction Safe",
      sub: "256-bit encrypted · Verified",
    },
  ];

  return (
    <section className="relative z-10 w-full bg-[#020617] px-6 py-20">
      <div className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">
            See It In Action
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
            How Fintellix Protects Every Transaction
          </h2>
        </div>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-6 top-0 h-full w-[2px] bg-gradient-to-b from-teal-500/60 via-cyan-500/40 to-emerald-500/60" />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative flex items-start gap-5 pl-14"
              >
                {/* dot on the line */}
                <div className="absolute left-[17px] top-3 h-3 w-3 rounded-full border-2 border-teal-400 bg-[#020617]" />

                <div className="rounded-2xl border border-teal-500/20 bg-white/5 p-5 backdrop-blur-md w-full">
                  <div className="mb-2">{step.icon}</div>
                  <p className="text-sm font-bold text-white">{step.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{step.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   DESKTOP — full GSAP ScrollTrigger pinned animation
   ====================================================== */

function DesktopAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const lineTrackRef = useRef<HTMLDivElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const scanTextRef = useRef<HTMLParagraphElement>(null);
  const resultARef = useRef<HTMLDivElement>(null);
  const resultBRef = useRef<HTMLDivElement>(null);
  const shieldGlowRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      if (!section) return;

      gsap.set(cardRef.current, { xPercent: -150, opacity: 0 });
      gsap.set(labelRef.current, { opacity: 0, x: 60 });
      gsap.set(lineTrackRef.current, { opacity: 0 });
      gsap.set(lineFillRef.current, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(dotRef.current, { opacity: 0, scale: 0, left: "22%" });
      gsap.set(shieldRef.current, { scale: 0, opacity: 0 });
      gsap.set(ringRef.current, { scale: 0, opacity: 0 });
      gsap.set(scanTextRef.current, { opacity: 0, y: 20 });
      gsap.set(resultARef.current, { opacity: 0, y: 40, scale: 0.85 });
      gsap.set(resultBRef.current, { opacity: 0, y: 40, scale: 0.85 });
      gsap.set(shieldGlowRef.current, { opacity: 0 });
      gsap.set(headingRef.current, { opacity: 0, y: -20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=3000",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      /* Heading */
      tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0);

      /* BEAT 1 */
      tl.to(cardRef.current, { xPercent: 0, opacity: 1, duration: 1, ease: "power3.out" }, 0.2)
        .to(labelRef.current, { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }, 0.5);

      /* BEAT 2 */
      tl.to(lineTrackRef.current, { opacity: 1, duration: 0.2 }, 1.2)
        .to(lineFillRef.current, { scaleX: 1, duration: 1.4, ease: "none" }, 1.2)
        .to(dotRef.current, { opacity: 1, scale: 1, duration: 0.2 }, 1.2)
        .to(dotRef.current, { left: "50%", duration: 1.4, ease: "none" }, 1.2);

      tl.to(labelRef.current, { opacity: 0.2, duration: 0.4 }, 2.4);

      /* BEAT 3 */
      tl.to(dotRef.current, { opacity: 0, scale: 0, duration: 0.3 }, 2.6)
        .to(shieldRef.current, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.4)" }, 2.7)
        .to(ringRef.current, { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" }, 2.9)
        .to(scanTextRef.current, { opacity: 1, y: 0, duration: 0.5 }, 3.0);

      /* BEAT 4 */
      tl.to(scanTextRef.current, { opacity: 0, duration: 0.3 }, 3.7)
        .to(shieldGlowRef.current, { opacity: 1, duration: 0.5 }, 3.8)
        .to(ringRef.current, { borderColor: "rgba(45,212,191,0.6)", duration: 0.4 }, 3.8)
        .to(resultARef.current, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.2)" }, 4.1)
        .to(resultBRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.2)" }, 4.3)
        .to({}, { duration: 0.8 }, 4.9);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 w-full bg-[#020617]"
      style={{ minHeight: "100vh" }}
    >
      <div
        ref={containerRef}
        className="relative mx-auto flex h-screen max-w-6xl items-center justify-center overflow-hidden px-12"
      >
        {/* HEADING */}
        <div
          ref={headingRef}
          className="pointer-events-none absolute left-0 right-0 top-16 z-20 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">
            See It In Action
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
            How Fintellix Protects Every Transaction
          </h2>
        </div>

        {/* CREDIT CARD */}
        <div
          ref={cardRef}
          className="absolute left-[8%] top-1/2 -translate-y-1/2"
        >
          <div className="relative h-[190px] w-[300px] rounded-2xl border border-teal-500/20 bg-white/5 p-6 shadow-2xl shadow-teal-500/10 backdrop-blur-md">
            <div className="mb-6 h-9 w-12 rounded-md bg-gradient-to-br from-amber-400/80 to-amber-600/60" />
            <p className="font-mono text-sm tracking-[0.25em] text-slate-300">
              •••• •••• •••• 4291
            </p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Cardholder</p>
                <p className="text-xs font-medium text-slate-300">FINTELLIX USER</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Expires</p>
                <p className="text-xs font-medium text-slate-300">12/28</p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-teal-400/10" />
            <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-teal-500/5 blur-xl" />
          </div>
        </div>

        {/* LABEL */}
        <div
          ref={labelRef}
          className="absolute right-[8%] top-1/2 -translate-y-1/2"
        >
          <div className="rounded-2xl border border-teal-500/20 bg-white/5 px-6 py-4 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">Step 1</p>
            <p className="mt-1 text-lg font-bold text-white">Transaction Initiated</p>
            <p className="mt-1 text-sm text-slate-400">₹12,499 · Amazon India</p>
          </div>
        </div>

        {/* DATA LINE */}
        <div
          ref={lineTrackRef}
          className="pointer-events-none absolute left-[22%] top-1/2 h-[2px] w-[28%] -translate-y-1/2 bg-slate-800"
        >
          <div
            ref={lineFillRef}
            className="h-full w-full bg-gradient-to-r from-teal-500 to-cyan-400 shadow-[0_0_12px_2px_rgba(45,212,191,0.3)]"
          />
        </div>

        {/* TRAVELING DOT */}
        <div
          ref={dotRef}
          className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400 shadow-[0_0_16px_4px_rgba(45,212,191,0.5)]"
        />

        {/* SHIELD */}
        <div
          ref={shieldRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative flex h-28 w-28 items-center justify-center">
            <div
              ref={shieldGlowRef}
              className="pointer-events-none absolute -inset-5 rounded-full bg-teal-500/20 blur-2xl"
            />
            <svg
              className="relative z-10 h-16 w-16 text-teal-400 drop-shadow-[0_0_20px_rgba(45,212,191,0.4)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </div>

        {/* SCANNING RING */}
        <div
          ref={ringRef}
          className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400/40"
          style={{
            animation: "scrollStorySpin 3s linear infinite",
            borderTopColor: "transparent",
          }}
        />

        {/* SCANNING TEXT */}
        <p
          ref={scanTextRef}
          className="absolute left-1/2 top-[calc(50%+100px)] -translate-x-1/2 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300"
        >
          AI Scanning…
        </p>

        {/* RESULT CARDS */}
        <div className="absolute left-1/2 top-[calc(50%+90px)] flex -translate-x-1/2 gap-4">
          <div
            ref={resultARef}
            className="rounded-2xl border border-teal-500/20 bg-white/5 px-6 py-4 text-center backdrop-blur-md"
          >
            <p className="text-2xl">✅</p>
            <p className="mt-1 text-sm font-bold text-emerald-400">Transaction Safe</p>
          </div>
          <div
            ref={resultBRef}
            className="rounded-2xl border border-teal-500/20 bg-white/5 px-6 py-4 text-center backdrop-blur-md"
          >
            <p className="text-2xl">🔒</p>
            <p className="mt-1 text-sm font-bold text-teal-300">256-bit Encrypted</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollStorySpin {
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}

/* ======================================================
   MAIN EXPORT — switches between desktop and mobile
   ====================================================== */

export default function ScrollStorySection() {
  const [isMobile, setIsMobile] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* avoid hydration mismatch — render nothing until mounted */
  if (!mounted) return <div className="h-screen bg-[#020617]" />;

  return isMobile ? <MobileFallback /> : <DesktopAnimation />;
}
