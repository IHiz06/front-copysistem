"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cart } from "@/lib/cart";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ProductoDetallePage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const [p,       setP]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx,  setImgIdx]  = useState(0);
  const [qty,     setQty]     = useState(1);
  const [added,   setAdded]   = useState(false);

  useEffect(() => {
    fetch(`${API}/catalogo/productos/${id}`)
      .then(r => r.json())
      .then(d => { setP(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Navbar/>
      <div className="flex-1 flex items-center justify-center"><div className="spinner"/></div>
      <Footer/>
    </div>
  );

  if (!p) return (
    <div className="min-h-screen flex flex-col"><Navbar/>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-[#555]">Producto no encontrado</p>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm">← Volver</button>
      </div>
      <Footer/>
    </div>
  );

  const imgs      = p.imagenes?.length ? p.imagenes : (p.imagen_url ? [{ id_imagen: 0, url_imagen: p.imagen_url }] : []);
  const precio    = p.precio_vigente ?? Number(p.precio_venta);
  const sinStock  = p.stock !== undefined && p.stock !== null && p.stock <= 0;
  const off       = p.precio_oferta && Number(p.precio_oferta) < Number(p.precio_venta)
    ? Math.round((1 - Number(p.precio_oferta) / Number(p.precio_venta)) * 100) : 0;

  const agregar = () => {
    cart.agregar({
      id_producto: p.id_producto, nombre: p.nombre,
      precio, imagen_url: p.imagen_url, codigo_sku: p.codigo_sku, cantidad: qty,
    });
    setAdded(true); setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col"><Navbar/>
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11.5px] text-[#3a3a3a] mb-8">
          <Link href="/" className="hover:text-[#F5C200] transition-colors">Inicio</Link>
          <span>›</span>
          <Link href="/productos" className="hover:text-[#F5C200] transition-colors">Catálogo</Link>
          <span>›</span>
          <span className="text-[#666]">{p.nombre}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ── Galería ── */}
          <div className="flex flex-col gap-4">
            <motion.div key={imgIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="card relative overflow-hidden" style={{ background: "#0d0d0d", aspectRatio: "1" }}>
              {off > 0 && <span className="absolute top-4 left-4 z-10 badge badge-red text-[12px]">-{off}% OFF</span>}
              {imgs[imgIdx]
                ? <img src={imgs[imgIdx].url_imagen} alt={p.nombre} className="w-full h-full object-contain p-8"/>
                : <div className="w-full h-full flex items-center justify-center text-8xl text-[#1a1a1a]">🖨️</div>}
            </motion.div>

            {imgs.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {imgs.map((img: any, i: number) => (
                  <button key={img.id_imagen} onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? "border-[#F5C200] scale-105" : "border-[#1a1a1a] hover:border-[#333]"}`}
                    style={{ background: "#0d0d0d" }}>
                    <img src={img.url_imagen} alt="" className="w-full h-full object-contain p-1"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .45 }}>
            {p.marca && (
              <span className="text-[10px] font-bold tracking-[.18em] uppercase block mb-2"
                style={{ color: "var(--gold)", fontFamily: "var(--font-display)" }}>{p.marca}</span>
            )}
            <h1 className="text-[28px] font-black leading-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>{p.nombre}</h1>
            <p className="text-[11.5px] text-[#3a3a3a] font-mono mb-5">SKU: {p.codigo_sku}</p>

            {/* Precio */}
            <div className="flex items-end gap-5 mb-5">
              <div>
                {off > 0 && <div className="text-[13px] text-[#3a3a3a] line-through mb-0.5">S/ {Number(p.precio_venta).toFixed(2)}</div>}
                <div className="text-[38px] font-black" style={{ fontFamily: "var(--font-display)" }}>
                  <span className="text-[18px] text-[#555] font-medium mr-1">S/</span>{precio.toFixed(2)}
                </div>
              </div>
              {p.aplicar_igv && <span className="text-[11px] text-[#444] mb-2">IGV incluido</span>}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              {sinStock
                ? <span className="badge badge-gray">Sin stock disponible</span>
                : <>
                    <div className="w-2 h-2 rounded-full bg-[#22c55e]"/>
                    <span className="text-[12.5px] text-[#22c55e]">
                      {p.stock != null ? `${p.stock} en stock` : "En stock"}
                    </span>
                  </>}
            </div>

            {/* Cantidad + Agregar */}
            {!sinStock && (
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border border-[#1e1e1e] rounded-lg overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors text-lg">−</button>
                  <span className="w-10 text-center text-[14px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(q + 1, p.stock || 99))}
                    className="w-10 h-10 text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors text-lg">+</button>
                </div>
                <motion.button whileTap={{ scale: .95 }} onClick={agregar}
                  className={`btn flex-1 justify-center py-3 text-[14px] ${added ? "btn-dark !text-[#22c55e] !border-[#22c55e]" : "btn-gold"}`}>
                  {added ? "✓ Agregado al carrito" : "Agregar al carrito"}
                </motion.button>
              </div>
            )}

            {/* Specs */}
            {(p.modelo || p.color || p.peso_kg || p.dimensiones) && (
              <div className="card p-5 mb-6">
                <h3 className="text-[10px] font-bold tracking-[.12em] uppercase text-[#444] mb-4"
                  style={{ fontFamily: "var(--font-display)" }}>Especificaciones</h3>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {[["Modelo", p.modelo], ["Color", p.color],
                    ["Peso", p.peso_kg ? `${p.peso_kg} kg` : null],
                    ["Dimensiones", p.dimensiones]].filter(r => r[1]).map(([k, v]) => (
                    <div key={k as string}>
                      <dt className="text-[10.5px] text-[#444]">{k}</dt>
                      <dd className="text-[12.5px] text-[#ccc] mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Descripción */}
            {p.descripcion && (
              <div>
                <h3 className="text-[10px] font-bold tracking-[.12em] uppercase text-[#444] mb-3"
                  style={{ fontFamily: "var(--font-display)" }}>Descripción</h3>
                <p className="text-[13.5px] text-[#666] leading-relaxed whitespace-pre-line">{p.descripcion}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
