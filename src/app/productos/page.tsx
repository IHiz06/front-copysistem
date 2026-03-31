export const dynamic = 'force-dynamic';
"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const get = (p:string) => fetch(`${API}${p}`).then(r=>r.json()).catch(()=>[]);

export default function ProductosPage() {
  const sp = useSearchParams(); const router = useRouter();
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0); const [hayMas, setHayMas] = useState(false);
  const [marca, setMarca] = useState(sp.get("marca")||"");
  const [orden, setOrden] = useState("reciente");
  const buscar = sp.get("buscar")||""; const catId = sp.get("categoria"); const oferta = sp.get("oferta")==="true";

  const cargar = useCallback(async (reset=false) => {
    setLoading(true);
    const s = reset ? 0 : skip;
    const qs = new URLSearchParams();
    if (buscar) qs.set("buscar",buscar);
    if (catId) qs.set("categoria",catId);
    if (marca) qs.set("marca",marca);
    if (oferta) qs.set("oferta","true");
    qs.set("skip",String(s)); qs.set("limit","20");
    const d = await get(`/catalogo/productos?${qs}`);
    setProductos(p => reset ? d : [...p,...d]);
    setHayMas(d.length===20);
    if (reset) setSkip(0);
    setLoading(false);
  },[buscar,catId,marca,oferta,skip]);

  useEffect(()=>{ cargar(true); },[buscar,catId,marca,oferta]);
  useEffect(()=>{ get("/catalogo/categorias").then(setCategorias); get("/catalogo/marcas").then(setMarcas); },[]);

  const sorted = [...productos].sort((a,b) => {
    if (orden==="precio-asc") return a.precio_vigente-b.precio_vigente;
    if (orden==="precio-desc") return b.precio_vigente-a.precio_vigente;
    if (orden==="nombre") return a.nombre.localeCompare(b.nombre);
    return 0;
  });

  const filtrar = (k:string,v:string) => { const p=new URLSearchParams(sp.toString()); v?p.set(k,v):p.delete(k); router.push(`/productos?${p}`); };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <div className="container py-8 flex gap-8 flex-1">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 hidden lg:flex flex-col gap-5">
          <div>
            <h3 className="text-[10px] font-bold tracking-[.15em] uppercase text-[#444] mb-2.5" style={{fontFamily:"var(--font-display)"}}>Categorías</h3>
            <div className="flex flex-col gap-0.5">
              <button onClick={()=>filtrar("categoria","")} className={`text-left px-2.5 py-2 rounded-lg text-[12.5px] transition-colors ${!catId?"text-[#F5C200] bg-[#1a1000]":"text-[#555] hover:text-white hover:bg-[#1a1a1a]"}`}>Todos</button>
              {categorias.map(c=><button key={c.id_categoria} onClick={()=>filtrar("categoria",String(c.id_categoria))} className={`text-left px-2.5 py-2 rounded-lg text-[12.5px] transition-colors ${catId===String(c.id_categoria)?"text-[#F5C200] bg-[#1a1000]":"text-[#555] hover:text-white hover:bg-[#1a1a1a]"}`}>{c.nombre}</button>)}
            </div>
          </div>
          {marcas.length>0 && (
            <div>
              <h3 className="text-[10px] font-bold tracking-[.15em] uppercase text-[#444] mb-2.5" style={{fontFamily:"var(--font-display)"}}>Marcas</h3>
              {marcas.map(m=><label key={m} className="flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-[#1a1a1a] rounded-lg text-[12.5px]"><input type="checkbox" checked={marca===m} onChange={()=>setMarca(p=>p===m?"":m)} className="accent-[#F5C200]"/><span className={marca===m?"text-[#F5C200]":"text-[#555]"}>{m}</span></label>)}
            </div>
          )}
          <label className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-[#1a1a1a] rounded-lg text-[12.5px]">
            <input type="checkbox" checked={oferta} onChange={()=>filtrar("oferta",oferta?"":"true")} className="accent-[#F5C200]"/>
            <span className="text-[#555]">Solo ofertas</span>
          </label>
        </aside>

        {/* Contenido */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              {buscar && <p className="text-[11px] text-[#444] mb-1">Buscando: <span style={{color:"var(--gold)"}}>"{buscar}"</span></p>}
              <h1 className="text-[20px] font-black" style={{fontFamily:"var(--font-display)"}}>
                {oferta?"Ofertas":catId?categorias.find(c=>String(c.id_categoria)===catId)?.nombre||"Productos":"Catálogo"}
                <span className="text-[13px] font-normal text-[#444] ml-2">{sorted.length} resultados</span>
              </h1>
            </div>
            <select value={orden} onChange={e=>setOrden(e.target.value)} className="input w-auto text-[12px] h-9 pl-3 pr-8">
              <option value="reciente">Más recientes</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre">A — Z</option>
            </select>
          </div>

          {loading && !productos.length ? <div className="flex justify-center py-24"><div className="spinner"/></div>
          : sorted.length===0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-[17px] font-bold mb-2" style={{fontFamily:"var(--font-display)"}}>Sin resultados</h3>
              <p className="text-[#444] text-[13px] mb-6">Prueba otros filtros</p>
              <button onClick={()=>router.push("/productos")} className="btn btn-ghost btn-sm">Limpiar filtros</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {sorted.map((p,i)=><ProductCard key={p.id_producto} p={p} i={i}/>)}
              </div>
              {hayMas && <div className="flex justify-center mt-8"><button onClick={()=>{setSkip(s=>s+20);cargar(false);}} disabled={loading} className="btn btn-ghost">{loading?"Cargando...":"Cargar más"}</button></div>}
            </>
          )}
        </main>
      </div>
      <Footer/>
    </div>
  );
}
