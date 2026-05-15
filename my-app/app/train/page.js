'use client';

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Train, ArrowRight, MapPin, Calendar as CalendarIcon, Info } from "lucide-react"
import Loading from "@/components/loading"
import TrainCard from "@/components/traincard";
import NotFound from "@/components/notfound";
import { useSession } from "@/components/auth-provider";
import { GlassCard } from "@/components/design-system/GlassCard"

function SearchTrainInner() {
    const { data: session, status } = useSession()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [trainResults, setTrainResults] = useState([]);

    const from = searchParams.get('from_station')
    const to = searchParams.get('to_station')
    const date = searchParams.get('date')  
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!from || !to ) {
            setTrainResults([])
            setLoading(false)
            return
        }

        const fetchTrains = async () => {
            setLoading(true)
            try {
                const url = new URLSearchParams({
                    from_station: from,
                    to_station: to,
                    date: date
                })
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get_trains?${url.toString()}`, {
                  headers: session?.accessToken
                    ? { 'Authorization': `Bearer ${session.accessToken}` }
                    : {}
                })
                const data = await res.json()
                if (data.ok) {
                    setTrainResults(data.journeys)
                } else {
                    setTrainResults([])
                }
            } catch (error) {
                console.error('Failed to load train results', error)
                setTrainResults([])
            }
            setLoading(false)
        }
        
        if (status !== 'loading') {
            fetchTrains()
        }
    
    }, [from, status, to, date, session])

    const handleClick = (train) => {
        const {id}  = train
        router.push(`/book?journey_id=${id}&from_station=${from}&to_station=${to}`)
    }

    return (
        <div className="relative min-h-screen py-12">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 size-[600px] rounded-full bg-blue-600/5 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 size-[600px] rounded-full bg-orange-600/5 blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4">
                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4"
                        >
                            Journey Intelligence
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-extrabold text-white"
                        >
                            Available Routes
                        </motion.h1>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-4 flex items-center gap-4 text-slate-400"
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="size-4 text-orange-500" />
                                <span className="font-bold text-slate-200">{from}</span>
                            </div>
                            <ArrowRight className="size-4 text-slate-600" />
                            <div className="flex items-center gap-2">
                                <MapPin className="size-4 text-orange-500" />
                                <span className="font-bold text-slate-200">{to}</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-white/10">
                                <CalendarIcon className="size-4 text-slate-500" />
                                <span>{date}</span>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <GlassCard className="py-3 px-5 border-white/5 bg-white/5 flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <Info className="size-4" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Journeys</p>
                                <p className="text-lg font-bold text-white">{trainResults.length}</p>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col gap-6">
                            {[1, 2, 3].map(i => (
                                <GlassCard key={i} className="h-48 animate-pulse bg-white/5 border-white/5" />
                            ))}
                        </div>
                    ) : (
                        trainResults.length > 0 ? (
                            <div className="flex flex-col gap-6">
                                <AnimatePresence mode="popLayout">
                                    {trainResults.map((train, idx) => (
                                        <motion.div
                                            key={train.id || idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <TrainCard train={train} bnFunction={() => handleClick(train)} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <NotFound error={true} message="No trains found for this route" />
                        )
                    )}
                </div>
            </div>
        </div>
    )
}

export default function SearchTrain() {
    return (
        <Suspense fallback={<Loading />}>
            <SearchTrainInner />
        </Suspense>
    )
}

