"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth, useApi } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../page";

export default function AdminUsuarios() {
  const { isAdmin } = useAuth(); const router = useRouter(); const api = useApi();
  const [users,  setUsers]  = useState<any[]>([]);
  const [roles,  setRoles]  = useState<any[]>([]);
  const [modal,  setModal]  = useState<"crear"|"rol"|null>(null);
  const [sel,    setSel]    = useState<any>(null);
  const [form,   setForm]   = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState("");

  useEffect(()=>{ if (!isAdmin) { router.replace("/admin"); return; } cargar(); },[isAdmin]);

  const cargar = async () => {
    const [u, r] = await Promise.all([api<any[]>("/admin/usuarios").catch(()=>[]), api<any[]>("/admin/roles").catch(()=>[])]);
    setUsers(u); setRoles(r);
  };

  const crearUsuario = async () => {
    setSaving(true); setMsg("");
    try {
      await api("/admin/usuarios", { method:"POST", body:JSON.stringify(form) });
      setMsg("✓ Usuario creado"); await cargar(); setTimeout(()=>setModal(null),1000);
    } catch(e:any) { setMsg("✗ "+e.message); }
    finally { setSaving(false); }
  };

  const asignarRol = async (id_rol: number) => {
    if (!sel) return; setSaving(true);
    try {
      await api(`/admin/usuarios/${sel.id_usuario}/roles`, { method:"POST", body:JSON.stringify({id_rol}) });
      await cargar(); setModal(null);
    } catch(e:any) { setMsg("✗ "+e.message); }
    finally { setSaving(false); }
  };

  const cambiarEstado = async (id: number, estado: string) => {
    await api(`/admin/usuarios/${id}/estado?estado=${estado}`, { method:"PATCH" });
    cargar();
  };

  const f = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}));

  return (
    <div className="admin-layout">
      <AdminSidebar active="/admin/usuarios"/>
      <main className="admin-main overflow-y-auto">
        <div className="p-7">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[22px] font-black" style={{fontFamily:"var(--font-display)"}}>Usuarios y Roles</h1>
            <button onClick={()=>{setForm({});setMsg("");setModal("crear");}} className="btn btn-gold">+ Nuevo usuario</button>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-[12.5px]">
              <thead><tr className="border-b border-[#111]" style={{background:"#0f0f0f"}}>
                {["Usuario","Email","Roles","Estado","Último login","Acciones"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[.1em] uppercase text-[#444]">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u.id_usuario} className="border-b border-[#0f0f0f] hover:bg-[#0f0f0f]">
                    <td className="px-4 py-3 font-medium text-[#ccc]">{u.nombre_usuario}</td>
                    <td className="px-4 py-3 text-[#555]">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(u.roles||[]).map((r:string) => <span key={r} className={`badge ${r==="Administrador"?"badge-gold":"badge-blue"}`}>{r}</span>)}
                        {!(u.roles||[]).length && <span className="badge badge-gray">Sin rol</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select value={u.estado} onChange={e=>cambiarEstado(u.id_usuario,e.target.value)}
                        className={`badge cursor-pointer border-0 outline-none ${u.estado==="activo"?"badge-green":u.estado==="bloqueado"?"badge-red":"badge-gray"}`}
                        style={{background:"transparent"}}>
                        {["activo","inactivo","suspendido","bloqueado"].map(e=><option key={e} value={e}>{e}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-[#444] text-[11px]">{u.ultimo_login?new Date(u.ultimo_login).toLocaleDateString("es-PE"):"Nunca"}</td>
                    <td className="px-4 py-3">
                      <button onClick={()=>{setSel(u);setMsg("");setModal("rol");}} className="btn btn-dark btn-sm text-[10px]">+ Rol</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {modal==="crear" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={e=>e.target===e.currentTarget&&setModal(null)}>
            <motion.div initial={{scale:.9}} animate={{scale:1}} exit={{scale:.9}} className="card p-7 w-full max-w-sm">
              <h2 className="text-[17px] font-black mb-5" style={{fontFamily:"var(--font-display)"}}>Nuevo Usuario</h2>
              <div className="flex flex-col gap-4">
                <div><label className="lbl">Email *</label><input type="email" className="input" value={form.email||""} onChange={e=>f("email",e.target.value)}/></div>
                <div><label className="lbl">Nombre usuario *</label><input className="input" value={form.nombre_usuario||""} onChange={e=>f("nombre_usuario",e.target.value)}/></div>
                <div><label className="lbl">Contraseña *</label><input type="password" className="input" value={form.contrasena||""} onChange={e=>f("contrasena",e.target.value)}/></div>
                <div><label className="lbl">Rol *</label>
                  <select className="input" value={form.id_rol||""} onChange={e=>f("id_rol",Number(e.target.value))}>
                    <option value="">— Seleccionar —</option>
                    {roles.map(r=><option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
                  </select>
                </div>
                {msg && <p className={`text-[12px] text-center ${msg.startsWith("✗")?"text-[#ef4444]":"text-[#22c55e]"}`}>{msg}</p>}
                <div className="flex gap-3">
                  <button onClick={()=>setModal(null)} className="btn btn-dark flex-1 btn-sm">Cancelar</button>
                  <button onClick={crearUsuario} disabled={saving} className="btn btn-gold flex-1 btn-sm justify-center">{saving?"...":"Crear"}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {modal==="rol" && sel && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={e=>e.target===e.currentTarget&&setModal(null)}>
            <motion.div initial={{scale:.9}} animate={{scale:1}} exit={{scale:.9}} className="card p-7 w-full max-w-sm">
              <h2 className="text-[17px] font-black mb-2" style={{fontFamily:"var(--font-display)"}}>Asignar Rol</h2>
              <p className="text-[12px] text-[#555] mb-5">{sel.nombre_usuario}</p>
              <div className="flex flex-col gap-2">
                {roles.map(r=>(
                  <button key={r.id_rol} onClick={()=>asignarRol(r.id_rol)} disabled={saving}
                    className="btn btn-dark justify-start gap-3 text-[13px]">
                    <span className={`badge ${r.nombre==="Administrador"?"badge-gold":"badge-blue"}`}>{r.nombre}</span>
                    <span className="text-[#444] text-[11px]">Nivel {r.nivel_acceso}</span>
                  </button>
                ))}
                {msg && <p className="text-[12px] text-center text-[#ef4444]">{msg}</p>}
                <button onClick={()=>setModal(null)} className="text-[11px] text-[#333] hover:text-white text-center mt-2">Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
