"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cart } from "@/lib/cart";

interface P { id_producto:number; codigo_sku:string; nombre:string; marca?:string; precio_venta:number; precio_oferta?:number; precio_vigente?:number; imagen_url?:string; stock?:number; activo:boolean }
export default function ProductCard({ p, i=0 }: { p:P; i?:number }) {
  const [added, setAdded] = useState(false);
  const sinStock = p.stock !== undefined && p.stock !== null && p.stock <= 0;
  const precio   = p.precio_vigente ?? (p.precio_oferta && p.precio_oferta < p.precio_venta ? p.precio_oferta : p.precio_venta);
  const off      = p.precio_oferta && p.precio_oferta < p.precio_venta
    ? Math.round((1 - p.precio_oferta / p.precio_venta) * 100) : 0;

  const add = (e:React.MouseEvent) => {
    e.preventDefault(); if (sinStock) return;
    cart.agregar({ id_producto:p.id_producto, nombre:p.nombre, precio, imagen_url:p.imagen_url, codigo_sku:p.codigo_sku });
    setAdded(true); setTimeout(()=>setAdded(false), 1800);
  };

  return (
    <motion.article
      initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}
      transition={{duration:.35, delay:i*.05, ease:[.25,.46,.45,.94]}}
      whileHover={{y:-3}} className="card flex flex-col overflow-hidden group"
    >
      <Link href={`/productos/${p.id_producto}`} className="relative block overflow-hidden" style={{aspectRatio:"1",background:"#0f0f0f"}}>
        {off > 0 && <span className="absolute top-2.5 left-2.5 z-10 badge badge-red">-{off}%</span>}
        {p.stock !== undefined && p.stock !== null && p.stock > 0 && p.stock <= 5 && (
          <span className="absolute top-2.5 right-2.5 z-10 badge badge-gold">¡Últimas!</span>
        )}
        {sinStock && <span className="absolute top-2.5 right-2.5 z-10 badge badge-gray">Sin stock</span>}
        {p.imagen_url
          ? <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" loading="lazy"/>
          : <div className="w-full h-full flex items-center justify-center text-5xl text-[#1a1a1a]">🖨️</div>}
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-1.5">
        {p.marca && <span className="text-[10px] font-bold tracking-[.15em] uppercase" style={{color:"var(--gold)",fontFamily:"var(--font-display)"}}>{p.marca}</span>}
        <Link href={`/productos/${p.id_producto}`} className="text-[13.5px] font-medium text-[#ccc] hover:text-white transition-colors line-clamp-2 flex-1 leading-snug">{p.nombre}</Link>
        <p className="text-[10.5px] text-[#3a3a3a] font-mono">{p.codigo_sku}</p>
      </div>

      <div className="px-4 pb-4 flex items-end justify-between gap-2">
        <div>
          {off > 0 && (
            <div className="text-[11px] text-[#444] line-through">
              S/ {Number(p.precio_venta).toFixed(2)}
            </div>
          )}
          <div className="text-[19px] font-black" style={{fontFamily:"var(--font-display)"}}>
            <span className="text-[11px] font-medium text-[#555] mr-0.5">S/</span>{precio.toFixed(2)}
          </div>
        </div>
        <motion.button whileTap={{scale:.92}} onClick={add} disabled={sinStock}
          className={`btn btn-sm ${added?"btn-dark !text-[var(--green)] !border-[var(--green)]":sinStock?"btn-dark":added?"btn-dark":"btn-gold"}`}>
          {added ? "✓" : sinStock ? "—" : (<><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Agregar</>)}
        </motion.button>
      </div>
    </motion.article>
  );
}
