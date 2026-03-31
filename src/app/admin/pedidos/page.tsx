"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth, useApi } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../page";

const FLUJO: Record<string,string|null> = {
  borrador:"confirmado", confirmado:"en_preparacion", en_preparacion:"listo",
  listo:"despachado", despachado:"entregado", entregado:null, anulado:null
};
const ESTCOLOR: Record<string,string> = {
  borrador:"badge-gray",confirmado:"badge-blue",en_preparacion:"badge-gold",
  listo:"badge-gold",despachado:"badge-blue",entregado:"badge-green",anulado:"badge-red"
};

export default function AdminPedidos() {
  const { isStaff } = useAuth(); const router = useRouter(); const api = useApi();
  const [pedidos,  setPedidos]  = useState<any[]>([]);
  const [filtro,   setFiltro]   = useState("todos");
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { if (!isStaff) { router.replace("/login"); return; } cargar(); }, [isStaff, filtro]);

  const cargar = async () => {
    setLoading(true);
    const q = filtro !== "todos" ? `?estado=${filtro}` : "";
    const r = await api<any[]>(`/admin/pedidos${q}`).catch(()=>[]);
    setPedidos(r); setLoading(false);
  };

  const abrir = async (p: any) => {
    const full = await api<any>(`/admin/pedidos/${p.id_pedido}`).catch(()=>p);
    setSelected(full);
  };

  const avanzar = async () => {
    if (!selected) return;
    const sig = FLUJO[selected.estado];
    if (!sig) return;
    setSaving(true);
    await api(`/admin/pedidos/${selected.id_pedido}/estado`, { method:"PATCH", body:JSON.stringify({estado:sig}) });
    await cargar(); setSelected(null); setSaving(false);
  };
  const anular = async () => {
    const motivo = prompt("Motivo de anulación:");
    if (!motivo) return;
    setSaving(true);
    await api(`/admin/pedidos/${selected.id_pedido}/estado`, { method:"PATCH", body:JSON.stringify({estado:"anulado",motivo_anulacion:motivo}) });
    await cargar(); setSelected(null); setSaving(false);
  };

  const ESTADOS = ["todos","borrador","confirmado","en_preparacion","listo","despachado","entregado","anulado"];
  return (
    <div className="admin-layout">
      <AdminSidebar active="/admin/pedidos"/>
      <main className="admin-main overflow-y-auto">
        <div className="p-7">
          <h1 className="text-[22px] font-black mb-5" style={{fontFamily:"var(--font-display)"}}>Pedidos</h1>
          <div className="flex flex-wrap gap-2 mb-5">
            {ESTADOS.map(e=>(
              <button key={e} onClick={()=>setFiltro(e)}
                className={`btn btn-sm ${filtro===e?"btn-gold":"btn-dark"} capitalize`}>
                {e==="todos"?"Todos":e.replace("_"," ")}
              </button>
            ))}
          </div>
          {loading ? <div className="flex justify-center py-20"><div className="spinner"/></div> : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead><tr className="border-b border-[#111]" style={{background:"#0f0f0f"}}>
                    {["N° Pedido","Cliente","Canal","Total","Pago","Estado","Fecha",""].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[.1em] uppercase text-[#444]">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {pedidos.map(p => (
                      <tr key={p.id_pedido} className="border-b border-[#0f0f0f] hover:bg-[#0f0f0f] transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px]" style={{color:"var(--gold)"}}>{p.numero_pedido}</td>
                        <td className="px-4 py-3 max-w-[130px] truncate text-[#ccc]">{p.cliente}</td>
                        <td className="px-4 py-3 capitalize text-[#555]">{p.canal_venta}</td>
                        <td className="px-4 py-3 font-bold" style={{fontFamily:"var(--font-display)"}}>S/ {p.total.toFixed(2)}</td>
                        <td className="px-4 py-3"><span className={`badge ${p.pago_aprobado?"badge-green":"badge-gray"}`}>{p.pago_aprobado?"Pagado":"Pend."}</span></td>
                        <td className="px-4 py-3"><span className={`badge ${ESTCOLOR[p.estado]} capitalize`}>{p.estado.replace("_"," ")}</span></td>
                        <td className="px-4 py-3 text-[#444] text-[11px]">{p.fecha_pedido?.split("T")[0]}</td>
                        <td className="px-4 py-3"><button onClick={()=>abrir(p)} className="btn btn-dark btn-sm text-[10px]">Gestionar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!pedidos.length && <p className="text-center py-10 text-[#333] text-[12px]">Sin pedidos</p>}
              </div>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
            <motion.div initial={{scale:.9}} animate={{scale:1}} exit={{scale:.9}} className="card p-7 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-[16px] font-black" style={{fontFamily:"var(--font-display)"}}>{selected.numero_pedido}</h2>
                  <p className="text-[12px] text-[#555]">{selected.cliente}</p>
                </div>
                <span className={`badge ${ESTCOLOR[selected.estado]}`}>{selected.estado.replace("_"," ")}</span>
              </div>
              <div className="flex flex-col gap-2 mb-5">
                {(selected.detalles||[]).map((d:any) => (
                  <div key={d.id_producto} className="flex justify-between text-[12.5px] py-1.5 border-b border-[#0f0f0f]">
                    <span className="text-[#888] truncate max-w-[200px]">{d.nombre} × {d.cantidad}</span>
                    <span className="text-white font-medium ml-3">S/ {d.subtotal.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-black text-[15px] pt-2" style={{fontFamily:"var(--font-display)"}}>
                  <span>Total</span><span style={{color:"var(--gold)"}}>S/ {selected.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {FLUJO[selected.estado] && (
                  <button onClick={avanzar} disabled={saving} className="btn btn-gold justify-center">
                    {saving?"...": `→ ${FLUJO[selected.estado]?.replace("_"," ")}`}
                  </button>
                )}
                {!["anulado","entregado"].includes(selected.estado) && (
                  <button onClick={anular} className="btn btn-dark justify-center hover:!text-[#ef4444] hover:!border-[#ef4444]">Anular pedido</button>
                )}
                <button onClick={()=>setSelected(null)} className="text-[11px] text-[#333] hover:text-white text-center mt-1">Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
