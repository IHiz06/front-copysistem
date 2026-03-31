"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const get = (p:string) => fetch(`${API}${p}`).then(r=>r.json()).catch(()=>[]);

export default function Home() {
  const [destacados, setDestacados] = useState<any[]>([]);
  const [ofertas,    setOfertas]    = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);

  useEffect(()=>{
    get("/catalogo/destacados?limit=8").then(setDestacados);
    get("/catalogo/ofertas?limit=6").then(setOfertas);
    get("/catalogo/categorias").then(setCategorias);
  },[]);

  const fu = { hidden:{opacity:0,y:28}, show:{opacity:1,y:0,transition:{duration:.55,ease:[.25,.46,.45,.94]}} };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden flex items-center" style={{minHeight:"86vh",background:"linear-gradient(140deg,#080808 0%,#0e0e0e 55%,#120d00 100%)"}}>
        {/* Grid decorativo */}
        <div className="absolute inset-0 opacity-[.025]" style={{backgroundImage:"linear-gradient(#F5C200 1px,transparent 1px),linear-gradient(90deg,#F5C200 1px,transparent 1px)",backgroundSize:"64px 64px"}}/>
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] opacity-[.06] pointer-events-none" style={{background:"radial-gradient(circle,#F5C200 0%,transparent 70%)",transform:"translate(30%,-30%)"}}/>

        <div className="container relative z-10 py-24">
          <div className="max-w-2xl">
            <motion.div initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{duration:.45}}
              className="inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-[.12em] uppercase"
              style={{borderColor:"#2a2000",color:"var(--gold)",background:"#170f00",fontFamily:"var(--font-display)"}}>
              ✦ Solidez y Confianza · Huancayo
            </motion.div>

            <motion.h1 initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.1,ease:[.25,.46,.45,.94]}}
              className="text-[52px] md:text-[76px] font-black leading-[.9] tracking-tight mb-6"
              style={{fontFamily:"var(--font-display)"}}>
              Tu solución<span className="block" style={{color:"var(--gold)"}}>en impresión.</span>
            </motion.h1>

            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.4}}
              className="text-[15px] text-[#666] leading-relaxed mb-10 max-w-lg">
              Impresoras, fotocopiadoras, tóners e insumos. Especialistas en equipos de oficina con más de 10 años en Junín.
            </motion.p>

            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.5}} className="flex flex-wrap gap-4">
              <Link href="/productos" className="btn btn-gold text-[.85rem] px-8 py-4">Ver catálogo →</Link>
              <Link href="/servicios" className="btn btn-ghost text-[.85rem] px-8 py-4">Servicio Técnico</Link>
            </motion.div>

            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.7}}
              className="flex gap-10 mt-14 pt-10 border-t border-[#111]">
              {[["10+","Años"],["500+","Clientes"],["1000+","Equipos"]].map(([n,l])=>(
                <div key={l}>
                  <div className="text-[26px] font-black" style={{color:"var(--gold)",fontFamily:"var(--font-display)"}}>{n}</div>
                  <div className="text-[11px] text-[#444] mt-0.5">{l}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS ── */}
      {categorias.length > 0 && (
        <section className="py-18 border-b border-[#0f0f0f]">
          <div className="container py-16">
            <motion.h2 variants={fu} initial="hidden" whileInView="show" viewport={{once:true}} className="text-[28px] font-black mb-8" style={{fontFamily:"var(--font-display)"}}>Categorías</motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categorias.slice(0,4).map((c,i)=>(
                <motion.div key={c.id_categoria} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.07}}>
                  <Link href={`/productos?categoria=${c.id_categoria}`} className="card p-5 flex flex-col gap-3 hover:border-[#F5C200] group transition-colors block">
                    <span className="text-3xl">🖨️</span>
                    <div className="font-bold text-[14px] group-hover:text-[#F5C200] transition-colors" style={{fontFamily:"var(--font-display)"}}>{c.nombre}</div>
                    <div className="text-[11px] text-[#444]">Ver productos →</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── OFERTAS ── */}
      {ofertas.length > 0 && (
        <section className="py-16" style={{background:"#0c0c0c"}}>
          <div className="container">
            <div className="flex items-end justify-between mb-8">
              <div><span className="badge badge-red mb-2 block w-fit">Ofertas activas</span><motion.h2 variants={fu} initial="hidden" whileInView="show" viewport={{once:true}} className="text-[28px] font-black" style={{fontFamily:"var(--font-display)"}}>Precios especiales</motion.h2></div>
              <Link href="/productos?oferta=true" className="text-[12px] text-[#555] hover:text-[#F5C200] transition-colors">Ver todas →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {ofertas.map((p,i)=><ProductCard key={p.id_producto} p={p} i={i}/>)}
            </div>
          </div>
        </section>
      )}

      {/* ── DESTACADOS ── */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <motion.h2 variants={fu} initial="hidden" whileInView="show" viewport={{once:true}} className="text-[28px] font-black" style={{fontFamily:"var(--font-display)"}}>Productos destacados</motion.h2>
            <Link href="/productos" className="text-[12px] text-[#555] hover:text-[#F5C200] transition-colors">Ver todo →</Link>
          </div>
          {destacados.length > 0
            ? <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{destacados.map((p,i)=><ProductCard key={p.id_producto} p={p} i={i}/>)}</div>
            : <div className="flex justify-center py-20"><div className="spinner"/></div>}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 border-t border-[#111]">
        <div className="container">
          <motion.div variants={fu} initial="hidden" whileInView="show" viewport={{once:true}}
            className="card p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
            style={{background:"linear-gradient(135deg,#111 0%,#1a1000 100%)",borderColor:"#2a2000"}}>
            <div>
              <h2 className="text-[26px] font-black mb-2" style={{fontFamily:"var(--font-display)"}}>¿Tu equipo necesita servicio?</h2>
              <p className="text-[14px] text-[#555]">Diagnóstico gratuito para equipos adquiridos en nuestra tienda.</p>
            </div>
            <Link href="/servicios" className="btn btn-gold px-8 py-4 flex-shrink-0">Solicitar servicio →</Link>
          </motion.div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}
