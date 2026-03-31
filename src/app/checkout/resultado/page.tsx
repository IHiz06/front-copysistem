"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth, useApi } from "@/context/AuthContext";

export default function ResultadoPage() {
  const sp      = useSearchParams();
  const api     = useApi();
  const { user }= useAuth();
  const estado  = sp.get("estado") || "";
  const pedido  = sp.get("pedido") || "";
  const payId   = sp.get("payment_id") || sp.get("collection_id") || "";

  const [aprobado,  setAprobado]  = useState<boolean | null>(null);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (payId && pedido && estado === "aprobado") {
      setLoading(true);
      api("/pedidos/pago/verificar", {
        method: "POST",
        body: JSON.stringify({ payment_id: payId, numero_pedido: pedido }),
      })
        .then((r: any) => setAprobado(r.aprobado))
        .catch(() => setAprobado(false))
        .finally(() => setLoading(false));
    } else if (estado === "rechazado") {
      setAprobado(false);
    } else if (estado === "pendiente") {
      setAprobado(null);
    }
  }, [payId, pedido, estado]);

  const isAprobado  = estado === "aprobado" && aprobado !== false;
  const isRechazado = estado === "rechazado" || aprobado === false;
  const isPendiente = estado === "pendiente" && aprobado !== false;

  return (
    <div className="min-h-screen flex flex-col"><Navbar/>
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
          className="card p-10 w-full max-w-md text-center">
          {loading ? (
            <div className="py-8">
              <div className="spinner mx-auto mb-5"/>
              <p className="text-[13px] text-[#555]">Verificando tu pago en MercadoPago...</p>
            </div>
          ) : isAprobado ? (
            <>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: .15 }}
                className="text-6xl mb-5">✅</motion.div>
              <h1 className="text-[26px] font-black mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--green)" }}>¡Pago aprobado!</h1>
              <p className="text-[13.5px] text-[#777] mb-1">Tu pedido <span className="font-mono text-white">{pedido}</span> fue confirmado.</p>
              <p className="text-[12px] text-[#555] mb-8">Nos contactaremos para coordinar la entrega.</p>
              <div className="flex flex-col gap-3">
                <Link href="/mi-cuenta" className="btn btn-gold justify-center">Ver mis pedidos</Link>
                <Link href="/productos" className="btn btn-ghost justify-center text-[13px]">Seguir comprando</Link>
              </div>
            </>
          ) : isRechazado ? (
            <>
              <div className="text-6xl mb-5">❌</div>
              <h1 className="text-[26px] font-black mb-2" style={{ fontFamily: "var(--font-display)", color: "#ef4444" }}>Pago no completado</h1>
              <p className="text-[13.5px] text-[#777] mb-8">No pudimos procesar tu pago. Puedes intentarlo de nuevo.</p>
              <div className="flex flex-col gap-3">
                <Link href="/carrito" className="btn btn-gold justify-center">Volver al carrito</Link>
                <Link href="/productos" className="btn btn-ghost justify-center text-[13px]">Ver catálogo</Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-5">⏳</div>
              <h1 className="text-[26px] font-black mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--gold)" }}>Pago en proceso</h1>
              <p className="text-[13.5px] text-[#777] mb-8">Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
              <div className="flex flex-col gap-3">
                <Link href="/mi-cuenta" className="btn btn-ghost justify-center">Ver mis pedidos</Link>
                <Link href="/" className="btn btn-dark justify-center text-[13px]">Ir al inicio</Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
