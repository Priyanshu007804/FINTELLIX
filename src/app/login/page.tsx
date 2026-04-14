"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    // Loading state is purposefully not reset because page redirects
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#020617]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f172a]/50 p-8 shadow-2xl backdrop-blur-md"
      >
        <div className="text-center mb-8 flex flex-col items-center">
           <img src="/Logo.jpeg" alt="Fintellix Logo" className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-contain mb-6" />
           <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
             Sign in to Fintellix
           </h1>
           <p className="text-slate-400 font-medium">
             Your secure fintech portal.
           </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-[#020617] font-semibold transition hover:bg-slate-200 disabled:opacity-70 disabled:cursor-wait"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-black" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
               <path
                 d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                 fill="#EA4335"
               />
               <path
                 d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                 fill="#4285F4"
               />
               <path
                 d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                 fill="#FBBC05"
               />
               <path
                 d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.87037 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.31037 24.0001 12.0004 24.0001Z"
                 fill="#34A853"
               />
            </svg>
          )}
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}
