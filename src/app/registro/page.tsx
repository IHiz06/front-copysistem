"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({email:"",nombre_usuario:"",contrasena:""});
  const [err,  setErr]  = useState(""); const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr("");
    try {
      const r = await fetch(`${API}/auth/registro`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail);
      router.push("/login?msg=cuenta-creada");
    } catch(e:any) { setErr(e.message); }
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
          <h1 className="text-[24px] font-black" style={{fontFamily:"var(--font-display)"}}>Crear cuenta</h1>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div><label className="lbl">Email</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="input" placeholder="tu@email.com" required/></div>
          <div><label className="lbl">Nombre de usuario</label><input value={form.nombre_usuario} onChange={e=>setForm(f=>({...f,nombre_usuario:e.target.value}))} className="input" placeholder="minombre" required/></div>
          <div><label className="lbl">Contraseña <span className="normal-case text-[#333]">(mín. 8 chars)</span></label><input type="password" value={form.contrasena} onChange={e=>setForm(f=>({...f,contrasena:e.target.value}))} className="input" placeholder="••••••••" required minLength={8}/></div>
          {err && <p className="text-[12.5px] text-[#ef4444] text-center">{err}</p>}
          <button type="submit" disabled={loading} className="btn btn-gold justify-center py-3.5 w-full mt-1">{loading?"Registrando...":"Crear cuenta →"}</button>
        </form>
        <p className="mt-5 text-center text-[12px] text-[#444]">¿Ya tienes cuenta? <Link href="/login" style={{color:"var(--gold)"}}>Ingresa aquí</Link></p>
      </motion.div>
    </div>
  );
}
