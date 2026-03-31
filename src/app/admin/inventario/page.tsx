"use client";
// ── Admin Inventario ─────────────────────────────────────────
import { useEffect, useState } from "react";
import { useAuth, useApi } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../page";

export default function AdminInventario() {
  const { isStaff } = useAuth(); const router = useRouter(); const api = useApi();
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ if (!isStaff) { router.replace("/login"); return; }
    api<any[]>("/admin/inventario/alertas").then(a=>{ setAlertas(a); setLoading(false); }).catch(()=>setLoading(false));
  },[isStaff]);

  return (
    <div className="admin-layout">
      <AdminSidebar active="/admin/inventario"/>
      <main className="admin-main overflow-y-auto">
        <div className="p-7">
          <h1 className="text-[22px] font-black mb-2" style={{fontFamily:"var(--font-display)"}}>Inventario — Alertas</h1>
          <p className="text-[12px] text-[#555] mb-5">Productos con stock igual o menor al mínimo configurado.</p>
          {loading ? <div className="flex justify-center py-20"><div className="spinner"/></div> : alertas.length === 0
            ? <div className="card p-10 text-center"><p className="text-[#333] text-[14px]">✓ Todo en orden. Sin alertas de stock.</p></div>
            : (
              <div className="card overflow-hidden">
                <table className="w-full text-[12.5px]">
                  <thead><tr className="border-b border-[#111]" style={{background:"#0f0f0f"}}>
                    {["SKU","Nombre","Stock actual","Mínimo","Estado"].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[.1em] uppercase text-[#444]">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {alertas.map(a=>(
                      <tr key={a.id_producto} className="border-b border-[#0f0f0f] hover:bg-[#0f0f0f]">
                        <td className="px-4 py-3 font-mono text-[#555] text-[11px]">{a.sku}</td>
                        <td className="px-4 py-3 font-medium text-[#ccc] max-w-[200px] truncate">{a.nombre}</td>
                        <td className="px-4 py-3 font-black text-[14px] text-[#ef4444]" style={{fontFamily:"var(--font-display)"}}>{a.stock}</td>
                        <td className="px-4 py-3 text-[#555]">{a.minimo}</td>
                        <td className="px-4 py-3"><span className={`badge ${a.stock===0?"badge-red":"badge-gold"}`}>{a.stock===0?"Sin stock":"Stock bajo"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </main>
    </div>
  );
}
