export const dynamic = 'force-dynamic';
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth(); const router = useRouter(); const sp = useSearchParams();
  const [form, setForm] = useState({email:"",contrasena:""});
  const [err,  setErr]  = useState(""); const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr("");
    try {
      await login(form.email, form.contrasena);
      const roles = JSON.parse(localStorage.getItem("cs_session")||"{}").roles || [];
      const isStaff = roles.some((r:string) => ["Administrador","Empleado"].includes(r));
      router.push(isStaff ? "/admin" : (sp.get("redirect") || "/"));
    } catch(e:any) { setErr(e.message || "Credenciales incorrectas"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:"linear-gradient(135deg,#080808 0%,#0f0800 100%)"}}>
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} className="card p-9 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-[14px] text-black" style={{background:"var(--gold)",fontFamily:"var(--font-display)"}}>CS</div>
            <span className="text-[15px] font-bold" style={{fontFamily:"var(--font-display)"}}>Copy Systems</span>
          </Link>
          <h1 className="text-[24px] font-black" style={{fontFamily:"var(--font-display)"}}>Iniciar sesión</h1>
          <p className="text-[13px] text-[#555] mt-1">Ingresa con tu cuenta</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div><label className="lbl">Email</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="input" placeholder="tu@email.com" required/></div>
          <div><label className="lbl">Contraseña</label><input type="password" value={form.contrasena} onChange={e=>setForm(f=>({...f,contrasena:e.target.value}))} className="input" placeholder="••••••••" required/></div>
          {err && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-[12.5px] text-[#ef4444] text-center">{err}</motion.p>}
          <button type="submit" disabled={loading} className="btn btn-gold justify-center py-3.5 w-full mt-1">{loading?"Ingresando...":"Ingresar →"}</button>
        </form>
        <div className="mt-5 pt-5 border-t border-[#111] text-[12px] text-[#444] text-center space-y-1">
          <p>¿No tienes cuenta? <Link href="/registro" className="hover:text-[#F5C200]" style={{color:"var(--gold)"}}>Regístrate</Link></p>
          <p className="text-[11px] text-[#2a2a2a]">admin@tienda.com / admin123</p>
        </div>
      </motion.div>
    </div>
  );
}
