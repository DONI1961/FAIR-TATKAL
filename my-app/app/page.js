"use client"

import { motion } from "framer-motion"
import { ArrowRight, Ticket, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { signIn, useSession } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { GlassCard } from "@/components/design-system/GlassCard"
import { PremiumButton } from "@/components/design-system/PremiumButton"
import { TrainAnimation } from "@/components/design-system/TrainAnimation"

export default function Page() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.replace("/search")
  }, [session, router])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2)_0%,rgba(5,11,24,1)_100%)]" />
        <div className="absolute inset-0 hero-gradient opacity-60" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-12 lg:grid-cols-2 lg:items-center"
        >
          {/* Left Column: Hero Content */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="size-4 text-orange-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">The Future of Rail Travel</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
              Experience the <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-600 bg-clip-text text-transparent">Fair Tatkal</span> Era.
            </motion.h1>

            <motion.p variants={itemVariants} className="max-w-lg text-lg leading-relaxed text-slate-300">
              No more stressful races. No more bot advantages. Just a fair, transparent, and cinematic railway booking experience powered by weighted lottery intelligence.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ShieldCheck className="size-5 text-emerald-500" />
                Aadhaar Verified
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Zap className="size-5 text-blue-500" />
                2G-Optimized
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative mt-8">
              <TrainAnimation />
            </motion.div>
          </div>

          {/* Right Column: Sign In Card */}
          <motion.div variants={itemVariants} className="flex justify-center lg:justify-end">
            <GlassCard className="w-full max-w-md border-white/10 bg-white/5 p-10 text-center">
              <div className="mb-8">
                <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/40">
                  <Ticket className="size-10 text-white" />
                </div>
                <h2 className="mt-6 text-3xl font-bold text-white">Board the System</h2>
                <p className="mt-2 text-slate-400">Sign in with Google to start your fair journey.</p>
              </div>

              <div className="space-y-4">
                <PremiumButton 
                  onClick={() => signIn("google")}
                  className="w-full h-14 text-lg"
                >
                  Continue with Google
                  <ArrowRight className="size-5" />
                </PremiumButton>

                <p className="text-xs text-slate-500">
                  By continuing, you agree to our terms of service and fairness policy.
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">100%</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Fairness</div>
                </div>
                <div className="text-center border-x border-white/10">
                  <div className="text-xl font-bold text-white">0s</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">AI</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Anti-Bot</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Floating Ambient Elements */}
        <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-1/4 -right-20 size-80 rounded-full bg-orange-600/5 blur-[100px]" />
      </main>
    </div>
  )
}

