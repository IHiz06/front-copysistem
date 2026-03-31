"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useAuth, useApi } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../page";

export default function AdminProductos() {
  const { isStaff, isAdmin } = useAuth();
  const router   = useRouter();
  const api      = useApi();
  const imgRef   = useRef<HTMLInputElement>(null);

  const [productos,  setProductos]  = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [modal,      setModal]      = useState<"crear"|"editar"|"stock"|"imagenes"|null>(null);
  const [selected,   setSelected]   = useState<any>(null);
  const [form,       setForm]       = useState<Record<string,any>>({});
  const [imgFile,    setImgFile]    = useState<File|null>(null);
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState("");
  const [stockForm,  setStockForm]  = useState({cantidad:"",motivo:""});

  useEffect(() => { if (!isStaff) { router.replace("/login"); return; } cargar(); loadCats(); }, [isStaff]);

  const cargar = async (q?: string) => {
    setLoading(true);
    const res = await api<any[]>(`/admin/productos${q ? `?buscar=${q}` : ""}`).catch(()=>[]);
    setProductos(res); setLoading(false);
  };
  const loadCats = async () => setCategorias(await api<any[]>("/admin/categorias").catch(()=>[]));

  const abrirCrear = () => {
    setForm({ activo:true, aplicar_igv:true, es_servicio:false, id_unidad_medida:1 });
    setImgFile(null); setMsg(""); setModal("crear");
  };
  const abrirEditar = (p: any) => {
    setSelected(p);
    setForm({ nombre:p.nombre, descripcion:p.descripcion||"", precio_venta:p.precio_venta,
              precio_compra:p.precio_compra||0, precio_oferta:p.precio_oferta||"",
              id_categoria:p.id_categoria, marca:p.marca||"", modelo:p.modelo||"", activo:p.activo });
    setImgFile(null); setMsg(""); setModal("editar");
  };

  const guardar = async () => {
    setSaving(true); setMsg("");
    try {
      let prod: any;
      if (modal === "crear") {
        prod = await api("/admin/productos", { method:"POST", body:JSON.stringify(form) });
        setMsg("✓ Producto creado");
      } else {
        prod = await api(`/admin/productos/${selected.id_producto}`, { method:"PATCH", body:JSON.stringify(form) });
        setMsg("✓ Actualizado");
      }
      if (imgFile && prod?.id_producto) {
        const { user } = useAuth as any;
        const fd = new FormData(); fd.append("archivo", imgFile);
        const token = JSON.parse(localStorage.getItem("cs_session")||"{}").token;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL||"http://localhost:8000"}/admin/productos/${prod.id_producto}/imagenes?es_principal=true`,
          { method:"POST", headers:token?{"X-Session-Token":token}:{}, credentials:"include", body:fd });
        setMsg(m => m + " + imagen subida");
      }
      await cargar();
      setTimeout(() => setModal(null), 1200);
    } catch(e:any) { setMsg("✗ " + e.message); }
    finally { setSaving(false); }
  };

  const eliminar = async (p: any) => {
    if (!confirm(`¿Desactivar "${p.nombre}"?`)) return;
    await api(`/admin/productos/${p.id_producto}`, { method:"DELETE" });
    cargar();
  };

  const ajustarStock = async () => {
    setSaving(true); setMsg("");
    try {
      await api(`/admin/productos/${selected.id_producto}/inventario/ajuste`, {
        method:"POST", body:JSON.stringify({ cantidad:Number(stockForm.cantidad), motivo:stockForm.motivo })
      });
      setMsg("✓ Stock actualizado"); await cargar(); setTimeout(()=>setModal(null),1000);
    } catch(e:any) { setMsg("✗ "+e.message); }
    finally { setSaving(false); }
  };

  const eliminarImagen = async (id_producto: number, id_imagen: number) => {
    if (!confirm("¿Eliminar imagen?")) return;
    await api(`/admin/productos/${id_producto}/imagenes/${id_imagen}`, { method:"DELETE" });
    const updated = await api<any>(`/admin/productos/${id_producto}`);
    setSelected(updated);
  };

  const f = (k:string, v:any) => setForm(prev => ({...prev,[k]:v}));

  return (
    <div className="admin-layout">
      <AdminSidebar active="/admin/productos"/>
      <main className="admin-main overflow-y-auto">
        <div className="p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[22px] font-black" style={{fontFamily:"var(--font-display)"}}>Productos</h1>
              <p className="text-[12px] text-[#555]">{productos.length} productos</p>
            </div>
            {isAdmin && <button onClick={abrirCrear} className="btn btn-gold">+ Nuevo</button>}
          </div>

          {/* Búsqueda */}
          <div className="flex gap-3 mb-5">
            <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&cargar(search)}
              placeholder="SKU, nombre..." className="input max-w-xs text-[13px]"/>
            <button onClick={()=>cargar(search)} className="btn btn-dark btn-sm">Buscar</button>
            <button onClick={()=>{setSearch("");cargar();}} className="btn btn-dark btn-sm">×</button>
          </div>

          {/* Tabla */}
          {loading ? <div className="flex justify-center py-20"><div className="spinner"/></div> : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead><tr className="border-b border-[#111]" style={{background:"#0f0f0f"}}>
                    {["Imagen","Nombre / SKU","Precio","Compra","Stock","Estado","Acciones"].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[.1em] uppercase text-[#444]" style={{fontFamily:"var(--font-display)"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p.id_producto} className="border-b border-[#0f0f0f] hover:bg-[#0f0f0f] transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#111] flex items-center justify-center">
                            {p.imagen_url ? <img src={p.imagen_url} alt="" className="w-full h-full object-contain p-1"/> : <span className="text-xl">📦</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#ccc] max-w-[180px] truncate">{p.nombre}</p>
                          <p className="text-[10.5px] text-[#3a3a3a] font-mono">{p.codigo_sku}</p>
                        </td>
                        <td className="px-4 py-3 font-black text-[13px]" style={{fontFamily:"var(--font-display)",color:"var(--gold)"}}>S/ {p.precio_venta.toFixed(2)}</td>
                        <td className="px-4 py-3 text-[#444]">S/ {(p.precio_compra||0).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${p.bajo_minimo?"badge-red":"badge-green"}`}>{p.stock ?? 0}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${p.activo?"badge-green":"badge-gray"}`}>{p.activo?"Activo":"Inactivo"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={()=>abrirEditar(p)} className="btn btn-dark btn-sm text-[10px]">Editar</button>
                            <button onClick={()=>{setSelected(p);setStockForm({cantidad:"",motivo:""});setMsg("");setModal("stock");}} className="btn btn-dark btn-sm text-[10px]">Stock</button>
                            <button onClick={()=>{setSelected(p);setModal("imagenes");}} className="btn btn-dark btn-sm text-[10px]">Imgs</button>
                            {isAdmin && <button onClick={()=>eliminar(p)} className="btn btn-dark btn-sm text-[10px] hover:!text-[#ef4444]">×</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!productos.length && <p className="text-center py-10 text-[#333] text-[12px]">Sin productos</p>}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Modales ── */}
      <AnimatePresence>
        {(modal==="crear"||modal==="editar") && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={e=>e.target===e.currentTarget&&setModal(null)}>
            <motion.div initial={{scale:.9,y:20}} animate={{scale:1,y:0}} exit={{scale:.9,y:20}}
              className="card p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-[18px] font-black mb-6" style={{fontFamily:"var(--font-display)"}}>
                {modal==="crear"?"Nuevo Producto":"Editar Producto"}
              </h2>
              <div className="flex flex-col gap-4">
                {modal==="crear" && <div><label className="lbl">SKU *</label><input className="input" value={form.codigo_sku||""} onChange={e=>f("codigo_sku",e.target.value)}/></div>}
                <div><label className="lbl">Nombre *</label><input className="input" value={form.nombre||""} onChange={e=>f("nombre",e.target.value)}/></div>
                <div><label className="lbl">Descripción</label><textarea className="input resize-none" rows={3} value={form.descripcion||""} onChange={e=>f("descripcion",e.target.value)}/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="lbl">Precio venta *</label><input type="number" step=".01" className="input" value={form.precio_venta||""} onChange={e=>f("precio_venta",parseFloat(e.target.value))}/></div>
                  <div><label className="lbl">Precio compra</label><input type="number" step=".01" className="input" value={form.precio_compra||""} onChange={e=>f("precio_compra",parseFloat(e.target.value))}/></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="lbl">Precio oferta</label><input type="number" step=".01" className="input" value={form.precio_oferta||""} onChange={e=>f("precio_oferta",parseFloat(e.target.value)||null)}/></div>
                  <div><label className="lbl">Categoría</label>
                    <select className="input" value={form.id_categoria||""} onChange={e=>f("id_categoria",Number(e.target.value))}>
                      <option value="">— Seleccionar —</option>
                      {categorias.map(c=><option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="lbl">Marca</label><input className="input" value={form.marca||""} onChange={e=>f("marca",e.target.value)}/></div>
                  <div><label className="lbl">Modelo</label><input className="input" value={form.modelo||""} onChange={e=>f("modelo",e.target.value)}/></div>
                </div>
                <div>
                  <label className="lbl">Imagen principal</label>
                  <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e=>setImgFile(e.target.files?.[0]||null)}/>
                  <button type="button" onClick={()=>imgRef.current?.click()} className="btn btn-dark btn-sm w-full justify-center">
                    {imgFile ? `✓ ${imgFile.name}` : "Seleccionar imagen (JPG/PNG)"}
                  </button>
                </div>
                {msg && <p className={`text-[12px] text-center ${msg.startsWith("✗")?"text-[#ef4444]":"text-[#22c55e]"}`}>{msg}</p>}
                <div className="flex gap-3 mt-1">
                  <button onClick={()=>setModal(null)} className="btn btn-dark flex-1">Cancelar</button>
                  <button onClick={guardar} disabled={saving} className="btn btn-gold flex-1 justify-center">{saving?"Guardando...":"Guardar"}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {modal==="stock" && selected && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={e=>e.target===e.currentTarget&&setModal(null)}>
            <motion.div initial={{scale:.9}} animate={{scale:1}} exit={{scale:.9}} className="card p-7 w-full max-w-sm">
              <h2 className="text-[17px] font-black mb-1" style={{fontFamily:"var(--font-display)"}}>Ajustar Stock</h2>
              <p className="text-[12px] text-[#555] mb-5">{selected.nombre} · Stock actual: <strong className="text-white">{selected.stock ?? 0}</strong></p>
              <div className="flex flex-col gap-4">
                <div><label className="lbl">Cantidad (+entrada / −salida)</label>
                  <input type="number" className="input" value={stockForm.cantidad} onChange={e=>setStockForm(s=>({...s,cantidad:e.target.value}))} placeholder="+10 o -5"/></div>
                <div><label className="lbl">Motivo *</label>
                  <input className="input" value={stockForm.motivo} onChange={e=>setStockForm(s=>({...s,motivo:e.target.value}))} placeholder="Compra proveedor, merma..."/></div>
                {msg && <p className={`text-[12px] text-center ${msg.startsWith("✗")?"text-[#ef4444]":"text-[#22c55e]"}`}>{msg}</p>}
                <div className="flex gap-3">
                  <button onClick={()=>setModal(null)} className="btn btn-dark flex-1 btn-sm">Cancelar</button>
                  <button onClick={ajustarStock} disabled={saving||!stockForm.cantidad||!stockForm.motivo} className="btn btn-gold flex-1 btn-sm justify-center">{saving?"...":"Aplicar"}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {modal==="imagenes" && selected && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={e=>e.target===e.currentTarget&&setModal(null)}>
            <motion.div initial={{scale:.9}} animate={{scale:1}} exit={{scale:.9}} className="card p-7 w-full max-w-md">
              <h2 className="text-[17px] font-black mb-5" style={{fontFamily:"var(--font-display)"}}>Imágenes — {selected.nombre}</h2>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {(selected.imagenes||[]).map((img:any) => (
                  <div key={img.id_imagen} className="relative group">
                    <img src={img.url_imagen} alt="" className="w-full aspect-square object-contain rounded-lg bg-[#0f0f0f] p-2"/>
                    {img.es_principal && <span className="absolute top-1 left-1 badge badge-gold text-[8px]">★</span>}
                    <button onClick={()=>eliminarImagen(selected.id_producto,img.id_imagen)}
                      className="absolute top-1 right-1 w-5 h-5 bg-[#ef4444] text-white rounded-full text-[10px] hidden group-hover:flex items-center justify-center">×</button>
                  </div>
                ))}
                {!(selected.imagenes||[]).length && <p className="col-span-3 text-[12px] text-[#333] text-center py-4">Sin imágenes</p>}
              </div>
              <div className="flex flex-col gap-3">
                <input type="file" accept="image/*" className="hidden" id="img-upload-modal"
                  onChange={async e => {
                    const f = e.target.files?.[0]; if (!f) return;
                    const fd = new FormData(); fd.append("archivo", f);
                    const token = JSON.parse(localStorage.getItem("cs_session")||"{}").token;
                    setSaving(true);
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL||"http://localhost:8000"}/admin/productos/${selected.id_producto}/imagenes?es_principal=false`,
                      { method:"POST", headers:token?{"X-Session-Token":token}:{}, credentials:"include", body:fd });
                    const updated = await api<any>(`/admin/productos/${selected.id_producto}`);
                    setSelected(updated); await cargar(); setSaving(false);
                  }}/>
                <label htmlFor="img-upload-modal" className="btn btn-ghost btn-sm justify-center cursor-pointer">{saving?"Subiendo...":"+ Subir imagen"}</label>
                <button onClick={()=>setModal(null)} className="btn btn-dark btn-sm justify-center">Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
