"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cart as cartStore, type CartItem } from "@/lib/cart";
import { useAuth, useApi } from "@/context/AuthContext";

type Paso = 1 | 2 | 3;

export default function CarritoPage() {
  const router     = useRouter();
  const { user }   = useAuth();
  const api        = useApi();
  const [items,    setItems]    = useState<CartItem[]>([]);
  const [paso,     setPaso]     = useState<Paso>(1);
  const [pedidoId, setPedidoId] = useState<number | null>(null);
  const [numPedido,setNumPedido]= useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    setItems(cartStore.get());
    const onUpd = (e: Event) => setItems((e as CustomEvent).detail || cartStore.get());
    window.addEventListener("cart-update", onUpd);
    return () => window.removeEventListener("cart-update", onUpd);
  }, []);

  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const igv      = subtotal * 0.18;
  const total    = subtotal + igv;

  const set = (id: number, q: number) => { cartStore.set(id, q); setItems(cartStore.get()); };

  // Paso 1 → 2: crear pedido
  const crearPedido = async () => {
    if (!user) { router.push("/login?redirect=/carrito"); return; }
    setLoading(true); setError("");
    try {
      const idCliente = user.id_cliente;
      if (!idCliente) throw new Error("Perfil de cliente no configurado. Contacta al administrador.");

      const pedido = await api<any>("/pedidos", {
        method: "POST",
        body: JSON.stringify({
          id_cliente: idCliente,
          canal_venta: "web",
          tipo_venta: "delivery",
          detalles: items.map(i => ({
            id_producto: i.id_producto,
            cantidad: i.cantidad,
            precio_unitario: i.precio,
            descuento_porcentaje: 0,
          })),
        }),
      });
      setPedidoId(pedido.id_pedido);
      setNumPedido(pedido.numero_pedido);
      setPaso(2);
    } catch (e: any) {
      setError(e.message || "Error al crear pedido");
    } finally { setLoading(false); }
  };

  // Paso 2 → 3: pagar con MP
  const pagarMP = async () => {
    if (!pedidoId) return;
    setLoading(true); setError("");
    try {
      const pref = await api<any>("/pedidos/pago/preferencia", {
        method: "POST",
        body: JSON.stringify({ id_pedido: pedidoId }),
      });
      cartStore.limpiar();
      const url = process.env.NODE_ENV === "production" ? pref.init_point : pref.sandbox_init_point;
      window.location.href = url;
    } catch (e: any) {
      setError(e.message || "Error al iniciar pago");
      setLoading(false);
    }
  };

  if (items.length === 0 && paso === 1) return (
    <div className="min-h-screen flex flex-col"><Navbar/>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
        <div className="text-7xl">🛒</div>
        <h2 className="text-[22px] font-black" style={{ fontFamily: "var(--font-display)" }}>Tu carrito está vacío</h2>
        <p className="text-[#555] text-[13px]">Agrega productos desde el catálogo</p>
        <Link href="/productos" className="btn btn-gold">Ver catálogo →</Link>
      </div>
      <Footer/>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col"><Navbar/>
      <div className="container py-10">
        {/* Steps */}
        <div className="flex items-center gap-3 mb-10">
          {[["1","Carrito"], ["2","Confirmar"], ["3","Pago"]].map(([n, l], i) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-colors ${paso >= Number(n) ? "text-black" : "text-[#333] border border-[#222]"}`}
                style={paso >= Number(n) ? { background: "var(--gold)", fontFamily: "var(--font-display)" } : {}}>
                {n}
              </div>
              <span className={`text-[12.5px] font-medium transition-colors ${paso >= Number(n) ? "text-white" : "text-[#333]"}`}
                style={{ fontFamily: "var(--font-display)" }}>{l}</span>
              {i < 2 && <span className="text-[#1e1e1e] mx-1">──</span>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items / confirm */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {paso === 1 && (
              <AnimatePresence>
                {items.map(item => (
                  <motion.div key={item.id_producto} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
                    className="card p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#0d0d0d] flex-shrink-0">
                      {item.imagen_url
                        ? <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-contain p-1.5"/>
                        : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[13.5px] truncate">{item.nombre}</p>
                      <p className="text-[10.5px] text-[#3a3a3a] font-mono">{item.codigo_sku}</p>
                      <p className="text-[13px] font-bold mt-1" style={{ color: "var(--gold)", fontFamily: "var(--font-display)" }}>S/ {item.precio.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center border border-[#1e1e1e] rounded-lg overflow-hidden">
                      <button onClick={() => set(item.id_producto, item.cantidad - 1)} className="w-8 h-8 text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors">−</button>
                      <span className="w-8 text-center text-[13px] font-bold">{item.cantidad}</span>
                      <button onClick={() => set(item.id_producto, item.cantidad + 1)} className="w-8 h-8 text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors">+</button>
                    </div>
                    <button onClick={() => set(item.id_producto, 0)} className="text-[#2a2a2a] hover:text-[#ef4444] transition-colors p-1.5">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {paso === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-[#052010] flex items-center justify-center text-[#22c55e] text-lg">✓</div>
                  <div>
                    <h2 className="text-[17px] font-black" style={{ fontFamily: "var(--font-display)" }}>Pedido creado</h2>
                    <p className="text-[11px] text-[#555] font-mono">{numPedido}</p>
                  </div>
                </div>
                <p className="text-[13px] text-[#666] mb-6">Tu pedido fue registrado. Completa el pago para confirmarlo.</p>
                {items.map(i => (
                  <div key={i.id_producto} className="flex justify-between text-[13px] py-2 border-b border-[#0f0f0f]">
                    <span className="text-[#777] truncate max-w-[220px]">{i.nombre} × {i.cantidad}</span>
                    <span className="text-white font-medium ml-3">S/ {(i.precio * i.cantidad).toFixed(2)}</span>
                  </div>
                ))}
                {error && <p className="text-[#ef4444] text-[12.5px] mt-4">{error}</p>}
                <motion.button whileTap={{ scale: .97 }} onClick={pagarMP} disabled={loading}
                  className="btn btn-gold w-full justify-center py-4 text-[14px] mt-6">
                  {loading ? "Redirigiendo..." : "Pagar con MercadoPago →"}
                </motion.button>
                <p className="text-[10.5px] text-[#333] text-center mt-3">Serás redirigido a la pasarela segura de MercadoPago</p>
              </motion.div>
            )}
          </div>

          {/* Resumen */}
          <div className="card p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-[15px] font-black mb-5" style={{ fontFamily: "var(--font-display)" }}>Resumen</h2>
            <div className="flex flex-col gap-3 text-[13px] mb-6">
              <div className="flex justify-between text-[#777]"><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-[#777]"><span>IGV 18%</span><span>S/ {igv.toFixed(2)}</span></div>
              <div className="flex justify-between text-[#777]"><span>Envío</span><span className="text-[#22c55e]">A coordinar</span></div>
              <div className="border-t border-[#111] pt-3 flex justify-between font-black text-[18px]" style={{ fontFamily: "var(--font-display)" }}>
                <span>Total</span>
                <span style={{ color: "var(--gold)" }}>S/ {total.toFixed(2)}</span>
              </div>
            </div>

            {error && paso === 1 && <p className="text-[#ef4444] text-[12px] mb-4">{error}</p>}

            {paso === 1 && (
              <motion.button whileTap={{ scale: .97 }} onClick={crearPedido} disabled={loading || !items.length}
                className="btn btn-gold w-full justify-center py-4 text-[13.5px]">
                {loading ? "Procesando..." : user ? "Proceder al pago →" : "Inicia sesión para continuar"}
              </motion.button>
            )}

            <div className="mt-5 pt-5 border-t border-[#0f0f0f] flex flex-col gap-1.5">
              {["🔒 Pago seguro con MercadoPago", "📦 Envío a Huancayo y alrededores", "📞 Soporte: (064) 123-4567"].map(t => (
                <p key={t} className="text-[11px] text-[#333]">{t}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
