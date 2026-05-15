'use client'

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from '@/components/auth-provider'
import Loading from '@/components/loading'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Chip } from '@heroui/react'
import { CircleCheckFill, CircleInfo, CreditCard, Ticket } from '@gravity-ui/icons'
import { Shield, Timer, CheckCircle2, AlertTriangle, XCircle, Lock, ArrowLeft } from 'lucide-react'

/**
 * Premium Payment Page
 * ─────────────────────
 * Displays fare breakdown, countdown timer, trust badges,
 * and Razorpay checkout integration with full error handling.
 */
const PaymentPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState('error')
  const [btloading, setBtLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const payButtonRef = useRef(null)

  const bookingId = searchParams.get('bookingId')

  // ─── Countdown Timer ───
  useEffect(() => {
    if (!booking || booking === 'error' || !booking.seconds_remaining) return
    if (booking.paid || booking.status === 'confirmed') return

    setTimeLeft(booking.seconds_remaining)

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [booking])

  const formatCountdown = (seconds) => {
    if (seconds === null || seconds === undefined) return '5:00'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const isExpiringSoon = timeLeft !== null && timeLeft < 60 && timeLeft > 0
  const isExpired = timeLeft !== null && timeLeft <= 0

  // ─── Pay Handler ───
  const handlePayClick = useCallback(async () => {
    if (btloading) return // Prevent duplicate clicks
    setBtLoading(true)
    setPaymentError(null)

    try {
      // 1. Create order from backend
      const orderUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/create_order'
      const payload = {
        bookingId: Number(bookingId),
        user_email: session?.user?.email,
      }
      const orderRes = await fetch(orderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(payload),
      })
      const orderData = await orderRes.json()

      if (!orderData.ok) {
        setPaymentError(orderData.message || 'Failed to create payment order')
        setBtLoading(false)
        return
      }

      // Update fare breakdown if available
      if (orderData.fare_breakdown) {
        setBooking(prev => ({ ...prev, ...orderData.fare_breakdown }))
      }

      // 2. Open Razorpay Popup
      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Tatkal Railway Booking',
        description: `Payment for Booking #${bookingId}`,
        image: '/favicon.ico',
        order_id: orderData.order_id,
        handler: async function (response) {
          // 3. Verify payment on backend
          try {
            const verifyUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/pay'
            const verifyPayload = {
              bookingId: Number(bookingId),
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              user_email: session?.user?.email,
            }
            const verifyRes = await fetch(verifyUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
              },
              body: JSON.stringify(verifyPayload),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.ok) {
              setPaymentSuccess(true)
              setTimeout(() => {
                router.push('/my_ticket')
              }, 2500)
            } else {
              setPaymentError(verifyData.message || 'Payment verification failed')
            }
          } catch (err) {
            setPaymentError('Network error during verification')
          }
        },
        prefill: {
          name: session?.user?.name || 'Customer',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: function () {
            setBtLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        setPaymentError(response.error.description || 'Payment failed. Please try again.')
        setBtLoading(false)
      })
      rzp.open()
    } catch (err) {
      setPaymentError('Something went wrong. Please try again.')
      setBtLoading(false)
    }
  }, [btloading, bookingId, session, router])

  // ─── Fetch Booking Details ───
  useEffect(() => {
    const fetchBookingDetails = async () => {
      const query = new URLSearchParams({ bookingId: bookingId }).toString()
      const url = process.env.NEXT_PUBLIC_BACKEND_URL + '/booking?' + query
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      })
      const data = await response.json()
      if (data && data.ok) {
        setBooking(data)
      }
      setLoading(false)
    }
    if (status === 'authentica  // ─── Payment Success Screen ───
  if (paymentSuccess) {
    return (
      <div className="app-shell flex min-h-[75vh] items-center justify-center py-8">
        <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-[2rem] border border-emerald-500/20 bg-gradient-to-b from-background to-emerald-500/5 p-8 shadow-xl shadow-emerald-500/10">
          {/* Success Animation */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-20" />
            <div className="relative rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 p-5 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="size-10 text-white" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-extrabold text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground">Your booking has been confirmed. Redirecting to My Tickets...</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 border border-emerald-500/20">
            <Shield size={14} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600">Verified & Secured by Razorpay</span>
          </div>
          <div className="w-full rounded-full bg-emerald-500/20 h-1.5 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-[progressBar_2.5s_ease-in-out_forwards]" />
          </div>
        </div>
        <style jsx>{`
          @keyframes progressBar {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {loading ? (
        <Loading />
      ) : booking === 'error' ? (
        <div className="app-shell flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-5">
            <CircleInfo className="size-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="text-lg text-muted-foreground">Failed to load booking details. Please try again.</p>
          <button
            onClick={() => router.push('/my_ticket')}
            className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-colors"
          >
            <ArrowLeft size={16} />
            Back to My Tickets
          </button>
        </div>
      ) : !['selected', 'payment_pending', 'payment_failed'].includes(booking.status) && !booking.paid ? (
        booking.status === 'confirmed' || booking.paid ? (
          /* Already Paid */
          <div className="app-shell flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
            <div className="relative">
              <div className="rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 p-6 shadow-lg shadow-emerald-500/20">
                <CircleCheckFill className="size-14 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-foreground">Ticket Confirmed</h1>
            <p className="max-w-md text-center text-lg text-muted-foreground">
              Your payment was successful and your booking is confirmed.
            </p>
            <button
              onClick={() => router.push('/my_ticket')}
              className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-colors"
            >
              <ArrowLeft size={16} />
              Back to My Tickets
            </button>
          </div>
        ) : booking.status === 'expired' ? (
          /* Expired */
          <div className="app-shell flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-secondary p-6 border border-border">
              <XCircle className="size-14 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Payment Window Expired</h1>
            <p className="max-w-md text-center text-lg text-muted-foreground">
              The 5-minute payment window has expired. Your seat has been offered to the next person in the waitlist.
            </p>
            <button
              onClick={() => router.push('/my_ticket')}
              className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-colors"
            >
              <ArrowLeft size={16} />
              Back to My Tickets
            </button>
          </div>
        ) : (
          /* Not Eligible */
          <div className="app-shell flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
            <div className="mb-2 rounded-full bg-amber-500/10 p-6 text-amber-500 border border-amber-500/20">
              <CircleInfo className="size-16" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Not Eligible for Payment</h1>
            <p className="max-w-md text-center text-lg text-muted-foreground">
              This booking is not eligible for payment at this time.
            </p>
            <button
              onClick={() => router.push('/my_ticket')}
              className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-colors"
            >
              <ArrowLeft size={16} />
              Back to My Tickets
            </button>
          </div>
        )
      ) : booking.paid ? (
        /* Already Paid */
        <div className="app-shell flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
          <div className="relative">
            <div className="rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 p-6 shadow-lg shadow-emerald-500/20">
              <CircleCheckFill className="size-14 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-foreground">Ticket Confirmed</h1>
          <p className="max-w-md text-center text-lg text-muted-foreground">
            Your payment was successful and your booking is confirmed.
          </p>
          <button
            onClick={() => router.push('/my_ticket')}
            className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-colors"
          >
            <ArrowLeft size={16} />
            Back to My Tickets
          </button>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════ */
        /* PAYMENT FORM                                    */
        /* ═══════════════════════════════════════════════ */
        <div className="app-shell flex min-h-[75vh] items-center justify-center py-8">
          <div className="flex w-full max-w-lg flex-col items-center gap-6 rounded-[2rem] border border-border bg-card p-8 shadow-xl shadow-foreground/5 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 w-full flex flex-col items-center gap-6">
              {/* Header Chip */}
              <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-bold text-primary">
                Payment required
              </div>

              {/* Title */}
              <div className="text-center">
                <h1 className="mb-2 text-2xl font-extrabold text-foreground">Complete Payment</h1>
                <p className="text-muted-foreground font-medium">You have been selected! Please pay to confirm your seat.</p>
              </div>

              {/* Countdown Timer */}
              {timeLeft !== null && timeLeft > 0 && (
                <div className={`flex items-center gap-2 rounded-2xl px-5 py-3 w-full justify-center transition-all ${
                  isExpiringSoon
                    ? 'bg-destructive/10 border-2 border-destructive animate-pulse'
                    : 'bg-amber-500/10 border border-amber-500/20'
                }`}>
                  <Timer size={18} className={isExpiringSoon ? 'text-destructive' : 'text-amber-500'} />
                  <span className={`text-lg font-black tabular-nums ${isExpiringSoon ? 'text-destructive' : 'text-amber-600'}`}>
                    {formatCountdown(timeLeft)}
                  </span>
                  <span className={`text-xs font-semibold ${isExpiringSoon ? 'text-destructive' : 'text-amber-500'}`}>
                    remaining
                  </span>
                </div>
              )}

              {isExpired && (
                <div className="flex items-center gap-2 rounded-2xl px-5 py-3 w-full justify-center bg-destructive/10 border border-destructive/20">
                  <XCircle size={18} className="text-destructive" />
                  <span className="text-sm font-bold text-destructive">Payment window has expired</span>
                </div>
              )}

              {/* Fare Breakdown Card */}
              <div className="w-full space-y-3 rounded-2xl border border-border bg-secondary/50 p-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Booking ID</span>
                  <span className="font-mono font-bold text-foreground">#{bookingId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase text-emerald-600 border border-emerald-500/20">
                    <Ticket className="size-3" />
                    Selected
                  </span>
                </div>

                {/* Fare Breakdown */}
                {booking.base_fare && (
                  <>
                    <div className="border-t border-border pt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Base Fare</span>
                        <span className="font-bold text-foreground">₹{booking.base_fare}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Convenience Fee (5%)</span>
                        <span className="font-bold text-foreground">₹{booking.convenience_fee}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">GST (18%)</span>
                        <span className="font-bold text-foreground">₹{booking.gst}</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Amount</span>
                  <span className="text-2xl font-black text-foreground">₹{booking.amount}</span>
                </div>
              </div>

              {/* Payment Error */}
              {paymentError && (
                <div className="w-full flex items-start gap-3 rounded-2xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <AlertTriangle size={18} className="text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-destructive">Payment Failed</p>
                    <p className="text-xs text-destructive/80 mt-0.5">{paymentError}</p>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <Button
                ref={payButtonRef}
                id="pay-now-button"
                className="h-14 w-full rounded-2xl bg-primary text-primary-foreground text-base font-bold shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                onClick={handlePayClick}
                disabled={btloading || isExpired}
              >
                {btloading ? (
                  <>
                    <Spinner className="mr-2" />
                    <span>Processing...</span>
                  </>
                ) : isExpired ? (
                  <>
                    <XCircle className="size-5 mr-2" />
                    <span>Expired</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="size-5 mr-2" />
                    <span>{booking.status === 'payment_failed' ? 'Retry Payment' : 'Pay Now'}</span>
                  </>
                )}
              </Button>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-muted-foreground/60">
                  <Lock size={12} />
                  <span className="text-[10px] font-black uppercase tracking-wider">SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground/60">
                  <Shield size={12} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Razorpay Secure</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground/60">
                  <CheckCircle2 size={12} />
                  <span className="text-[10px] font-black uppercase tracking-wider">PCI Compliant</span>
                </div>
              </div>

              {/* Back Link */}
              <button
                onClick={() => router.push('/my_ticket')}
                className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} />
                Back to My Tickets
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to My Tickets
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function PayPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentPage />
    </Suspense>
  )
}
