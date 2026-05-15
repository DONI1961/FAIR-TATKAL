'use client'
import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from '@/components/auth-provider'
import LotteryForm from '@/components/lotteryform'
import NotFound from '@/components/notfound'
import Loading from '@/components/loading'
import WindowOpening from '@/components/opening'
import WindowClosed from '@/components/closed'
import { GlassCard } from '@/components/design-system/GlassCard'

function BookPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const journey_id = searchParams.get('journey_id')
  const from_station = searchParams.get('from_station')
  const to_station = searchParams.get('to_station')

  const { data: session, status: authStatus } = useSession()

  const [hasTrain, setHasTrain] = useState(false)
  const [loading, setLoading] = useState(true)
  const [train, setTrain] = useState(null)

  const [opening, setOpening] = useState(null)
  const [seconds, setSeconds] = useState(null)

  const fetchData = async () => {
    if (!journey_id || authStatus !== 'authenticated') return

    try {
      const query = new URLSearchParams({
        journey_id: journey_id,
        from_station: from_station || '',
        to_station: to_station || ''
      })

      const trainUrl = process.env.NEXT_PUBLIC_BACKEND_URL + `/one_train?${query.toString()}`
      const trainRes = await fetch(trainUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })
      const trainData = await trainRes.json()

      if (trainData.ok) {
        trainData.train.journey_id = journey_id
        setTrain(trainData.train)
        setHasTrain(true)
      } else {
        setHasTrain(false)
      }

      const timeUrl = process.env.NEXT_PUBLIC_BACKEND_URL + `/get_time?${new URLSearchParams({ journey_id }).toString()}`
      const timeRes = await fetch(timeUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })
      const timeData = await timeRes.json()

      if (timeData.ok) {
        setOpening(timeData.status)
        if (timeData.status === 'opening' || timeData.status === 'open') {
          setSeconds(timeData.seconds)
        }
      }
    } catch (err) {
      console.error("Failed to fetch booking page data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchData()
    } else if (authStatus === 'unauthenticated') {
      setLoading(false)
    }
  }, [authStatus, journey_id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>
  if (!hasTrain) return <NotFound />

  return (
    <div className="relative min-h-screen py-12 px-4 flex flex-col items-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 size-[600px] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 size-[600px] rounded-full bg-orange-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {opening === 'opening' ? (
            <motion.div
              key="opening"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <WindowOpening second={seconds} fn={fetchData} />
            </motion.div>
          ) : opening === 'closed' ? (
            <motion.div
              key="closed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <WindowClosed />
            </motion.div>
          ) : opening === 'open' ? (
            <motion.div
              key="open"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <LotteryForm train={train} second={seconds} fn={fetchData} />
            </motion.div>
          ) : (
            <div key="loading" className="flex justify-center py-20">
              <Loading />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BookPageInner />
    </Suspense>
  )
}