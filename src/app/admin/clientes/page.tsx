"use client";
// ── Admin Clientes ───────────────────────────────────────────
import { useEffect, useState, useCallback } from "react"; // Añadimos useCallback
import { useAuth, useApi } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../page";

// 1. Definimos una Interfaz para evitar el error de "any"
interface Cliente {
  id_cliente: number;
  nombre_completo: string;
  numero_documento: string;
  telefono?: string;
  email?: string;
  segmento: "vip" | "frecuente" | "regular";
}

export default function AdminClientes() {
  const { isStaff } = useAuth();
  const router = useRouter();
  const api = useApi();

  // Usamos la interfaz en el estado
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [buscar, setBuscar] = useState("");
  const [loading, setLoading] = useState(true);

  // 2. Envolvemos 'cargar' en useCallback para que sea una dependencia estable
  const cargar = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const r = await api<Cliente[]>(`/admin/clientes${q ? `?buscar=${q}` : ""}`);
      setClientes(r || []);
    } catch (error) {
      console.error(error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [api]); // 'api' es dependencia de 'cargar'

  // 3. Corregimos las dependencias del useEffect
  useEffect(() => {
    if (!isStaff) {
      router.replace("/login");
      return;
    }
    cargar();
  }, [isStaff, router, cargar]); // Ahora incluimos router y cargar

  return (
    <div className="admin-layout">
      <AdminSidebar active="/admin/clientes" />
      <main className="admin-main overflow-y-auto">
        <div className="p-7">
          <h1 className="text-[22px] font-black mb-5" style={{ fontFamily: "var(--font-display)" }}>Clientes</h1>
          <div className="flex gap-3 mb-5">
            <input
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              onKeyDown={e => e.key === "Enter" && cargar(buscar)}
              placeholder="Nombre, documento, email..."
              className="input max-w-xs text-[13px]"
            />
            <button onClick={() => cargar(buscar)} className="btn btn-dark btn-sm">Buscar</button>
            <button onClick={() => { setBuscar(""); cargar(); }} className="btn btn-dark btn-sm">×</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner" /></div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-[#111]" style={{ background: "#0f0f0f" }}>
                    {["Nombre", "Documento", "Teléfono", "Email", "Segmento"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[.1em] uppercase text-[#444]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.id_cliente} className="border-b border-[#0f0f0f] hover:bg-[#0f0f0f]">
                      <td className="px-4 py-3 font-medium text-[#ccc]">{c.nombre_completo}</td>
                      <td className="px-4 py-3 text-[#555] font-mono">{c.numero_documento}</td>
                      <td className="px-4 py-3 text-[#555]">{c.telefono || "—"}</td>
                      <td className="px-4 py-3 text-[#555]">{c.email || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${c.segmento === "vip" ? "badge-gold" :
                            c.segmento === "frecuente" ? "badge-green" : "badge-gray"
                          } capitalize`}>
                          {c.segmento}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clientes.length === 0 && <p className="text-center py-10 text-[#333] text-[12px]">Sin clientes</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
