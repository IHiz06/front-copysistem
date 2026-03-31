"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { cart } from "@/lib/cart";

export default function Navbar() {
  const { user, logout, isStaff } = useAuth();
  const router = useRouter();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setCartCount(cart.count());
    const sync = (e: Event) => setCartCount((e as CustomEvent).detail?.length ?? cart.count());
    window.addEventListener("cart-update", sync);
    return () => window.removeEventListener("cart-update", sync);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { router.push(`/productos?buscar=${encodeURIComponent(search)}`); setMenuOpen(false); }
  };

  const NAV = [
    { href:"/productos", label:"Catálogo" },
    { href:"/productos?oferta=true", label:"Ofertas" },
    { href:"/servicios", label:"Técnico" },
    { href:"/nosotros", label:"Nosotros" },
  ];

  return (
    <>
      {/* Topbar */}
      <div className="hidden md:flex items-center justify-between px-8 py-1.5 text-[11px] text-[#555] border-b border-[#111]" style={{background:"#080808"}}>
        <span>📞 (064) 123-4567 &nbsp;·&nbsp; ✉ ventas@copysystems.com.pe</span>
        <span>Lun–Sáb · 9:00–19:00 · Huancayo, Junín</span>
      </div>

      <motion.header
        className="sticky top-0 z-50"
        style={{ background: scrolled ? "rgba(8,8,8,.97)" : "#080808", backdropFilter:"blur(14px)", borderBottom:"1px solid #111" }}
        animate={{ boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,.5)" : "none" }}
      >
        <div className="container flex items-center h-[66px] gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <motion.div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-[13px] text-black"
              style={{background:"var(--gold)", fontFamily:"var(--font-display)"}}
              whileHover={{scale:1.1, rotate:-4}} transition={{type:"spring",stiffness:400}}
            >CS</motion.div>
            <div className="hidden sm:block">
              <div className="text-[14px] font-bold text-white leading-none" style={{fontFamily:"var(--font-display)"}}>Copy Systems</div>
              <div className="text-[9px] tracking-[.2em] uppercase" style={{color:"var(--gold)"}}>E.I.R.L.</div>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-2">
            {NAV.map(n => (
              <Link key={n.href} href={n.href}
                className="px-3 py-1.5 rounded-md text-[12.5px] font-medium text-[#777] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                style={{fontFamily:"var(--font-display)"}}>
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden md:flex relative ml-auto">
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Buscar impresoras, tóners..." className="input h-9 text-[13px] pr-9" />
            <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#F5C200] transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isStaff && (
              <Link href="/admin" className="hidden sm:flex btn btn-gold btn-sm">⚙ Panel</Link>
            )}
            {user ? (
              <>
                <Link href="/mi-cuenta" className="text-[12px] text-[#777] hover:text-white transition-colors hidden sm:block">{user.nombre_usuario}</Link>
                <button onClick={async()=>{ await logout(); router.push("/"); }} className="text-[11px] text-[#444] hover:text-[#ef4444] transition-colors">Salir</button>
              </>
            ) : (
              <Link href="/login" className="btn btn-gold btn-sm">Ingresar</Link>
            )}

            {/* Cart */}
            <Link href="/carrito" className="relative p-2 text-[#666] hover:text-[#F5C200] transition-colors">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}
                    className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full text-[9px] font-black text-black flex items-center justify-center"
                    style={{background:"var(--gold)", fontFamily:"var(--font-display)"}}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <button onClick={()=>setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-[#666] hover:text-white transition-colors">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {menuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
              className="overflow-hidden border-t border-[#111] lg:hidden" style={{background:"#0c0c0c"}}>
              <div className="container py-4 flex flex-col gap-1">
                <form onSubmit={handleSearch} className="flex mb-3 gap-2">
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="input flex-1 h-9 text-[13px]"/>
                  <button type="submit" className="btn btn-gold btn-sm">→</button>
                </form>
                {NAV.map(n => <Link key={n.href} href={n.href} onClick={()=>setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-[13px] text-[#777] hover:text-white hover:bg-[#1a1a1a] transition-colors">{n.label}</Link>)}
                {isStaff && <Link href="/admin" onClick={()=>setMenuOpen(false)} className="px-3 py-2.5 text-[13px] font-bold" style={{color:"var(--gold)"}}>⚙ Panel Admin</Link>}
                {!user && <Link href="/login" onClick={()=>setMenuOpen(false)} className="btn btn-gold mt-2 justify-center">Ingresar</Link>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
