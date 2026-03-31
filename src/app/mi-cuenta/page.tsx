"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth, useApi } from "@/context/AuthContext";

const ESTCOLOR: Record<string, string> = {
  borrador:"badge-gray", confirmado:"badge-blue", en_preparacion:"badge-gold",
  listo:"badge-gold", despachado:"badge-blue", entregado:"badge-green", anulado:"badge-red"
};

export default function MiCuentaPage() {
  const { user, logout } = useAuth();
  const router           = useRouter();
  const api              = useApi();
  const [pedidos,  setPedidos]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<"pedidos"|"perfil"|"password">("pedidos");
  const [passForm, setPassForm] = useState({ actual: "", nueva: "" });
  const [passMsg,  setPassMsg]  = useState("");
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login?redirect=/mi-cuenta"); return; }
    api<any[]>("/pedidos/mis-pedidos").then(p => { setPedidos(p); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setPassMsg("");
    try {
      await api("/auth/cambiar-password", { method: "POST", body: JSON.stringify(passForm) });
      setPassMsg("✓ Contraseña actualizada");
      setPassForm({ actual: "", nueva: "" });
    } catch (err: any) { setPassMsg("✗ " + err.message); }
    finally { setSaving(false); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col"><Navbar/>
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar cuenta */}
          <aside className="md:col-span-1">
            <div className="card p-5 mb-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#1a1000] flex items-center justify-center text-2xl font-black mx-auto mb-3"
                style={{ color: "var(--gold)", fontFamily: "var(--font-display)" }}>
                {user.nombre_usuario.charAt(0).toUpperCase()}
              </div>
              <p className="font-bold text-[14px]">{user.nombre_usuario}</p>
              <div className="flex justify-center gap-1 mt-2 flex-wrap">
                {user.roles.length > 0
                  ? user.roles.map(r => <span key={r} className={`badge ${r === "Administrador" ? "badge-gold" : "badge-blue"} text-[9px]`}>{r}</span>)
                  : <span className="badge badge-gray text-[9px]">Cliente</span>}
              </div>
            </div>

            <nav className="card overflow-hidden">
              {[["pedidos", "🛒", "Mis pedidos"], ["perfil", "👤", "Mi perfil"], ["password", "🔒", "Contraseña"]].map(([k, ic, l]) => (
                <button key={k} onClick={() => setTab(k as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] border-b border-[#0f0f0f] last:border-0 transition-colors ${tab === k ? "text-[#F5C200] bg-[#1a1000] font-semibold" : "text-[#666] hover:text-white hover:bg-[#1a1a1a]"}`}
                  style={{ fontFamily: "var(--font-display)" }}>
                  <span>{ic}</span>{l}
                </button>
              ))}
              <button onClick={async () => { await logout(); router.push("/"); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[12px] text-[#333] hover:text-[#ef4444] transition-colors"
                style={{ fontFamily: "var(--font-display)" }}>
                <span>🚪</span>Cerrar sesión
              </button>
            </nav>
          </aside>

          {/* Contenido */}
          <main className="md:col-span-3">
            {tab === "pedidos" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-[20px] font-black mb-5" style={{ fontFamily: "var(--font-display)" }}>Mis Pedidos</h2>
                {loading ? <div className="flex justify-center py-12"><div className="spinner"/></div>
                : pedidos.length === 0 ? (
                  <div className="card p-10 text-center">
                    <div className="text-5xl mb-4">📦</div>
                    <p className="text-[#555] mb-4">Aún no tienes pedidos</p>
                    <Link href="/productos" className="btn btn-gold btn-sm">Ver catálogo</Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {pedidos.map(p => (
                      <div key={p.id_pedido} className="card p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-mono text-[12px]" style={{ color: "var(--gold)" }}>{p.numero_pedido}</p>
                            <p className="text-[11px] text-[#444] mt-0.5">{new Date(p.fecha_pedido).toLocaleDateString("es-PE", { day:"2-digit", month:"long", year:"numeric" })}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`badge ${ESTCOLOR[p.estado]} capitalize`}>{p.estado.replace("_"," ")}</span>
                            {p.pago_aprobado && <span className="badge badge-green">Pagado</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 mb-4">
                          {(p.detalles || []).slice(0, 3).map((d: any) => (
                            <div key={d.id_producto} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#0d0d0d] flex items-center justify-center flex-shrink-0">
                                {d.imagen ? <img src={d.imagen} alt="" className="w-full h-full object-contain p-1 rounded-lg"/> : <span className="text-lg">📦</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12.5px] truncate">{d.nombre}</p>
                                <p className="text-[11px] text-[#444]">× {d.cantidad} · S/ {d.subtotal?.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                          {(p.detalles?.length || 0) > 3 && (
                            <p className="text-[11px] text-[#444]">+{p.detalles.length - 3} producto(s) más</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-[#0f0f0f]">
                          <div>
                            <span className="text-[11px] text-[#444]">Total: </span>
                            <span className="font-black text-[16px]" style={{ fontFamily: "var(--font-display)", color: "var(--gold)" }}>S/ {Number(p.total).toFixed(2)}</span>
                          </div>
                          {p.estado === "borrador" && !p.pago_aprobado && (
                            <Link href="/carrito" className="btn btn-gold btn-sm">Completar pago</Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === "perfil" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-[20px] font-black mb-5" style={{ fontFamily: "var(--font-display)" }}>Mi Perfil</h2>
                <div className="card p-6 flex flex-col gap-4">
                  <div><label className="lbl">Usuario</label><p className="text-[14px] text-[#ccc]">{user.nombre_usuario}</p></div>
                  <div><label className="lbl">Roles</label>
                    <div className="flex gap-2 mt-1">
                      {user.roles.length > 0
                        ? user.roles.map(r => <span key={r} className={`badge ${r==="Administrador"?"badge-gold":"badge-blue"}`}>{r}</span>)
                        : <span className="badge badge-gray">Cliente</span>}
                    </div>
                  </div>
                  {user.roles.some(r => ["Administrador","Empleado"].includes(r)) && (
                    <div className="pt-3 border-t border-[#111]">
                      <Link href="/admin" className="btn btn-gold btn-sm">⚙ Ir al panel administrativo</Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === "password" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-[20px] font-black mb-5" style={{ fontFamily: "var(--font-display)" }}>Cambiar Contraseña</h2>
                <div className="card p-6 max-w-md">
                  <form onSubmit={cambiarPassword} className="flex flex-col gap-4">
                    <div><label className="lbl">Contraseña actual</label>
                      <input type="password" value={passForm.actual} onChange={e => setPassForm(f => ({...f,actual:e.target.value}))} className="input" required/></div>
                    <div><label className="lbl">Nueva contraseña <span className="normal-case text-[#333]">(mín. 8 chars)</span></label>
                      <input type="password" value={passForm.nueva} onChange={e => setPassForm(f => ({...f,nueva:e.target.value}))} className="input" required minLength={8}/></div>
                    {passMsg && <p className={`text-[12.5px] ${passMsg.startsWith("✓")?"text-[#22c55e]":"text-[#ef4444]"}`}>{passMsg}</p>}
                    <button type="submit" disabled={saving} className="btn btn-gold justify-center">{saving?"Guardando...":"Actualizar contraseña"}</button>
                  </form>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
