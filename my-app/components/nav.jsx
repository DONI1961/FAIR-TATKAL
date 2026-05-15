"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "@/components/auth-provider"
import { useState, useRef, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Avatar } from "@heroui/react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Ticket, 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X, 
  User,
  ChevronDown
} from "lucide-react"
import { PremiumButton } from "./design-system/PremiumButton"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const userLinks = [
    { href: "/search", label: "Find Trains", icon: Search },
    { href: "/my_ticket", label: "My Journeys", icon: Ticket },
  ]

  const adminLinks = [
    { href: "/addtrain", label: "Add Train", icon: PlusCircle },
    { href: "/result", label: "Lottery Engine", icon: LayoutDashboard },
    { href: "/passengers", label: "Passengers", icon: Users },
  ]

  return (
    <nav className="glass-nav border-white/5 bg-slate-950/40 backdrop-blur-2xl">
      <div className="app-shell flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href={session ? "/search" : "/"} className="group flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all">
            <Ticket className="size-5 text-white" />
            <div className="absolute -inset-1 rounded-xl bg-orange-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-white">Smart Rail</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500/80">Fair Tatkal</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {session && (
          <div className="hidden items-center gap-1 md:flex">
            {userLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all hover:bg-white/5",
                  pathname === href ? "text-orange-500" : "text-slate-300 hover:text-white"
                )}
              >
                <Icon className="size-4" />
                {label}
                {pathname === href && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-orange-500/10 border border-orange-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}

            {session.user.role === "admin" && (
              <div className="ml-4 flex items-center gap-1 border-l border-white/10 pl-4">
                {adminLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all hover:bg-indigo-500/10",
                      pathname === href ? "text-indigo-400" : "text-indigo-300/70 hover:text-indigo-300"
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile / Login */}
        <div className="flex items-center gap-4">
          {!session ? (
            <PremiumButton 
              onClick={() => signIn("google")}
              className="h-10 px-6 text-sm"
            >
              Sign In
            </PremiumButton>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-1.5 pr-4 transition-all hover:bg-white/10"
              >
                <Avatar className="size-8 rounded-xl ring-2 ring-orange-500/20">
                  <Avatar.Image src={session.user.image} alt={session.user.name} />
                  <Avatar.Fallback className="bg-orange-500 text-white">
                    <User className="size-4" />
                  </Avatar.Fallback>
                </Avatar>
                <div className="hidden text-left lg:block">
                  <p className="text-xs font-bold text-white leading-tight">{session.user.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{session.user.role}</p>
                </div>
                <ChevronDown className={cn("size-4 text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-2 backdrop-blur-2xl shadow-2xl"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-bold text-white">{session.user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <button
                        onClick={() => { router.push("/my_ticket"); setIsProfileOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Ticket className="size-4 text-orange-500" />
                        My Journeys
                      </button>
                      
                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="size-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex size-10 items-center justify-center rounded-xl bg-white/5 md:hidden"
          >
            {isMenuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-950/90 border-t border-white/5 backdrop-blur-3xl md:hidden"
          >
            <div className="app-shell py-6 space-y-6">
              <div className="space-y-2">
                {[...userLinks, ...(session?.user.role === 'admin' ? adminLinks : [])].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl px-4 py-4 text-lg font-semibold",
                      pathname === href ? "bg-orange-500/10 text-orange-500" : "text-slate-300"
                    )}
                  >
                    <Icon className="size-6" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

