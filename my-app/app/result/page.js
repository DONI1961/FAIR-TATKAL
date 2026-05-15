'use client'
import React, { useEffect, useState } from "react";
import Loading from "@/components/loading";
import NotFound from "@/components/notfound";
import TrainCard from "@/components/traincard";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Zap, ShieldAlert, Cpu } from "lucide-react";
import { GlassCard } from "@/components/design-system/GlassCard";

export default function ResultPage() {
    const [trains, setTrains] = useState([])
    const [loading, setLoading] = useState(true)
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        } else if (status === "authenticated" && session?.user?.role !== undefined && session?.user?.role !== "admin") {
            router.push("/");
        }
    }, [session, status, router]);

    const handlePublish = async (key) => {
        const query = new URLSearchParams({
            journey_id: key
        })
        
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + '/publish_lottery?' + query.toString()
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`
            },
        })
        const response = await res.json()
        
        // Refresh local state after successful publication
        if (response.ok) {
            setTrains(prev => prev.filter(t => t.id !== key))
            return true
        } else {
            return false
        }
    }

    useEffect(() => {
        const fetchTrains = async () => {
            setLoading(true)
            try {
                const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/un_published_trains')
                const data = await res.json()
                if (data.ok) {
                    setTrains(data.trains)
                }
            } catch (error) {
                console.error("Failed to fetch unpublished trains:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTrains()
    }, [])

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>

    return (
        <div className="relative min-h-screen py-12 px-4">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 size-[600px] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 size-[600px] rounded-full bg-accent/5 blur-[120px]" />
            </div>

            <div className="relative z-10 app-shell max-w-5xl">
                {/* Header Section */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                <Cpu className="size-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-foreground tracking-tight">Lottery Engine</h1>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Command & Control</p>
                            </div>
                        </div>
                        <p className="text-muted-foreground max-w-md font-medium">
                            Execute seat allocation protocols for completed booking windows. Verified by cryptographic fairness logic.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex gap-4"
                    >
                        <div className="px-6 py-3 rounded-2xl bg-secondary border border-border backdrop-blur-md shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Queue Depth</p>
                            <p className="text-2xl font-black text-foreground">{trains.length}</p>
                        </div>
                    </motion.div>
                </div>

                <AnimatePresence mode="popLayout">
                    {trains.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <NotFound error={true} message="No journeys pending allocation. The engine is on standby." />
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {trains.map((journey, index) => (
                                <motion.div
                                    key={journey.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group"
                                >
                                    <div className="mb-2 ml-4 flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-accent animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            Ready for Publication
                                        </span>
                                    </div>
                                    <TrainCard 
                                        train={journey} 
                                        bnName={'Initialize Allocation'} 
                                        bnFunction={() => handlePublish(journey.id)} 
                                        result={1}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* System Stats Footer */}
                {trains.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <GlassCard className="p-6">
                            <Zap className="size-5 text-yellow-500 mb-4" />
                            <h4 className="text-sm font-bold text-foreground mb-2">High Efficiency</h4>
                            <p className="text-xs text-muted-foreground font-medium">Allocations are processed across distributed compute nodes in under 500ms.</p>
                        </GlassCard>
                        <GlassCard className="p-6">
                            <ShieldAlert className="size-5 text-primary mb-4" />
                            <h4 className="text-sm font-bold text-foreground mb-2">Immutable Logs</h4>
                            <p className="text-xs text-muted-foreground font-medium">Every draw result is cryptographically signed and published to the public log.</p>
                        </GlassCard>
                        <GlassCard className="p-6">
                            <LayoutDashboard className="size-5 text-emerald-500 mb-4" />
                            <h4 className="text-sm font-bold text-foreground mb-2">Transparency Audit</h4>
                            <p className="text-xs text-muted-foreground font-medium">Auditors can verify seat distribution against priority scores in real-time.</p>
                        </GlassCard>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

