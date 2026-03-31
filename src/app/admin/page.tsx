"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useAuth, useApi } from "@/context/AuthContext";

// ── Sidebar Admin ─────────────────────────────────────────────
const LINKS = [
  { href:"/admin",           icon:"📊", label:"Dashboard" },
  { href:"/admin/productos", icon:"📦", label:"Productos" },
  { href:"/admin/pedidos",   icon:"🛒", label:"Pedidos" },
  { href:"/admin/clientes",  icon:"👥", label:"Clientes" },
  { href:"/admin/usuarios",  icon:"👤", label:"Usuarios" },
  { href:"/admin/inventario",icon:"📋", label:"Inventario" },
];

export function AdminSidebar({ active }: { active: string }) {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  return (
    <aside className="admin-sidebar">
      <div className="p-4 border-b border-[#111]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center font-black text-[12px] text-black" style={{background:"var(--gold)",fontFamily:"var(--font-display)"}}>CS</div>
          <span className="text-[12.5px] font-bold" style={{fontFamily:"var(--font-display)"}}>Panel Admin</span>
        </Link>
      </div>
      <nav className="flex-1 p-2.5 flex flex-col gap-0.5">
        {LINKS.filter(l => l.href !== "/admin/usuarios" || isAdmin).map(l => (
          <Link key={l.href} href={l.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12.5px] transition-colors ${active===l.href?"text-[#F5C200] bg-[#1a1000] font-semibold":"text-[#555] hover:text-white hover:bg-[#1a1a1a]"}`}
            style={{fontFamily:"var(--font-display)"}}>
            <span className="text-[15px]">{l.icon}</span>{l.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-[#111]">
        <p className="text-[11px] text-[#333] mb-1">Sesión activa</p>
        <p className="text-[12px] text-[#666] truncate">{user?.nombre_usuario}</p>
        <p className="text-[10px] text-[#2a2a2a] mb-2">{user?.roles.join(", ")}</p>
        <button onClick={async()=>{ await logout(); router.push("/login"); }} className="text-[11px] text-[#333] hover:text-[#ef4444] transition-colors">Cerrar sesión</button>
      </div>
    </aside>
  );
}

// ── Minigráfico de barras SVG ─────────────────────────────────
function BarChart({ data, color="#F5C200" }: { data: {dia:string;monto:number;cantidad:number}[]; color?:string }) {
  if (!data.length) return <div className="flex items-center justify-center h-32 text-[#333] text-[12px]">Sin datos esta semana</div>;
  const max = Math.max(...data.map(d => d.monto), 1);
  const W = 480, H = 120, PAD = 30, barW = (W - PAD * 2) / data.length * 0.6;
  const x = (i: number) => PAD + i * ((W - PAD * 2) / data.length) + (W - PAD*2)/data.length/2 - barW/2;
  const y = (v: number) => H - 20 - (v / max) * (H - 35);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{overflow:"visible"}}>
      {/* Grid lines */}
      {[0,.25,.5,.75,1].map((f,i) => (
        <line key={i} x1={PAD} y1={H-20-(f*(H-35))} x2={W-PAD} y2={H-20-(f*(H-35))} stroke="#1a1a1a" strokeWidth="1"/>
      ))}
      {data.map((d, i) => (
        <g key={i}>
          <motion.rect
            x={x(i)} y={H-20} width={barW} height={0} rx={3} fill={color} opacity={.85}
            animate={{ y: y(d.monto), height: H - 20 - y(d.monto) }}
            transition={{ duration: .6, delay: i * .07, ease: [.25,.46,.45,.94] }}
          />
          <text x={x(i)+barW/2} y={H-6} textAnchor="middle" fontSize="9" fill="#444"
            fontFamily="var(--font-display)">
            {new Date(d.dia).toLocaleDateString("es",{weekday:"short"}).replace(".","").slice(0,3)}
          </text>
          {d.monto > 0 && (
            <text x={x(i)+barW/2} y={y(d.monto)-5} textAnchor="middle" fontSize="8.5" fill={color} fontFamily="var(--font-display)">
              {d.monto >= 1000 ? `${(d.monto/1000).toFixed(1)}k` : d.monto.toFixed(0)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Donut chart de estados ────────────────────────────────────
const COLORES: Record<string,string> = {
  borrador:"#2a2a2a", confirmado:"#1e40af", en_preparacion:"#92400e",
  listo:"#065f46", despachado:"#4338ca", entregado:"#15803d", anulado:"#7f1d1d"
};

function DonutChart({ data }: { data:{estado:string;cantidad:number}[] }) {
  const total = data.reduce((a,d) => a+d.cantidad, 0) || 1;
  let cum = 0; const R = 48, CX = 60, CY = 60, STROKE = 18;
  const arcs = data.map(d => {
    const pct = d.cantidad / total;
    const startAngle = cum * 2 * Math.PI - Math.PI/2;
    cum += pct;
    const endAngle = cum * 2 * Math.PI - Math.PI/2;
    const x1 = CX + R * Math.cos(startAngle), y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle),   y2 = CY + R * Math.sin(endAngle);
    const large = pct > .5 ? 1 : 0;
    return { d: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`, color: COLORES[d.estado] || "#333", pct, label: d.estado, cantidad: d.cantidad };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" width="120" height="120">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1a1a1a" strokeWidth={STROKE}/>
        {arcs.map((a,i) => a.pct > 0 && (
          <motion.path key={i} d={a.d} fill="none" stroke={a.color} strokeWidth={STROKE}
            strokeLinecap="butt" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:.8,delay:i*.1}}/>
        ))}
        <text x={CX} y={CY+1} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="800" fill="white" fontFamily="var(--font-display)">{total}</text>
        <text x={CX} y={CY+13} textAnchor="middle" fontSize="7" fill="#555" fontFamily="var(--font-display)">PEDIDOS</text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {arcs.map((a,i) => (
          <div key={i} className="flex items-center gap-2 text-[11.5px]">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{background:a.color}}/>
            <span className="text-[#666] capitalize">{a.label.replace("_"," ")}</span>
            <span className="font-bold text-[#999] ml-auto pl-3">{a.cantidad}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────
export default function AdminDashboard() {
  const { isStaff } = useAuth();
  const router = useRouter();
  const api    = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isStaff) { router.replace("/login"); return; }
    api("/admin/dashboard").then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [isStaff]);

  const kpis = [
    { label:"Ventas hoy",         val:`S/ ${(data?.kpis?.ventas_hoy||0).toFixed(2)}`,        icon:"💰", color:"var(--gold)",  change:"+12%" },
    { label:"Pedidos por atender", val: data?.kpis?.pedidos_pendientes ?? "—",                icon:"🛒", color:"#60a5fa",     change:null },
    { label:"Ventas del mes",     val:`S/ ${(data?.kpis?.ventas_mes||0).toFixed(2)}`,         icon:"📈", color:"var(--green)", change:"+8%" },
    { label:"Clientes activos",   val: data?.kpis?.total_clientes ?? "—",                     icon:"👥", color:"#c084fc",     change:null },
    { label:"Productos activos",  val: data?.kpis?.total_productos ?? "—",                    icon:"📦", color:"#fb923c",     change:null },
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar active="/admin"/>
      <main className="admin-main overflow-y-auto">
        <div className="p-7 max-w-[1200px]">
          <div className="mb-7">
            <h1 className="text-[26px] font-black" style={{fontFamily:"var(--font-display)"}}>Dashboard</h1>
            <p className="text-[13px] text-[#555] mt-0.5">Resumen del negocio en tiempo real</p>
          </div>

          {loading ? <div className="flex justify-center py-24"><div className="spinner"/></div> : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-7">
                {kpis.map((k,i) => (
                  <motion.div key={k.label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*.07}}
                    className="card p-5">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-[10px] font-bold tracking-[.1em] uppercase text-[#444]" style={{fontFamily:"var(--font-display)"}}>{k.label}</p>
                      <span className="text-[18px]">{k.icon}</span>
                    </div>
                    <p className="text-[24px] font-black" style={{fontFamily:"var(--font-display)",color:k.color}}>{k.val}</p>
                    {k.change && <p className="text-[10px] text-[#27ae60] mt-1">↑ {k.change} vs. mes anterior</p>}
                  </motion.div>
                ))}
              </div>

              {/* Gráficas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
                {/* Barras semana */}
                <motion.div className="card p-6 md:col-span-2" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.3}}>
                  <h3 className="text-[13px] font-bold mb-4" style={{fontFamily:"var(--font-display)"}}>Ventas últimos 7 días</h3>
                  <BarChart data={data?.ventas_semana || []}/>
                </motion.div>
                {/* Donut estados */}
                <motion.div className="card p-6" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.4}}>
                  <h3 className="text-[13px] font-bold mb-5" style={{fontFamily:"var(--font-display)"}}>Pedidos por estado</h3>
                  <DonutChart data={data?.pedidos_estado || []}/>
                </motion.div>
              </div>

              {/* Tabla + alertas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Últimos pedidos */}
                <div className="card overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#111] flex items-center justify-between">
                    <h3 className="text-[13px] font-bold" style={{fontFamily:"var(--font-display)"}}>Últimos pedidos</h3>
                    <Link href="/admin/pedidos" className="text-[11px] text-[#555] hover:text-[#F5C200]">Ver todos →</Link>
                  </div>
                  <div className="divide-y divide-[#0f0f0f]">
                    {(data?.ultimos_pedidos || []).map((p:any) => (
                      <div key={p.id_pedido} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium truncate">{p.cliente}</p>
                          <p className="text-[10.5px] text-[#444] font-mono">{p.numero_pedido}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[12px] font-bold" style={{fontFamily:"var(--font-display)"}}>S/ {p.total.toFixed(2)}</p>
                          <span className={`badge badge-${p.estado==="entregado"?"green":p.estado==="anulado"?"red":p.estado==="confirmado"?"blue":"gray"} text-[9px]`}>{p.estado}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alertas stock */}
                <div className="card overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#111] flex items-center justify-between">
                    <h3 className="text-[13px] font-bold flex items-center gap-2" style={{fontFamily:"var(--font-display)"}}>
                      ⚠ Stock bajo
                      {data?.alertas_stock?.length > 0 && <span className="badge badge-red">{data.alertas_stock.length}</span>}
                    </h3>
                    <Link href="/admin/inventario" className="text-[11px] text-[#555] hover:text-[#F5C200]">Ver todo →</Link>
                  </div>
                  {(data?.alertas_stock || []).length === 0
                    ? <p className="text-center py-8 text-[#333] text-[12px]">✓ Sin alertas de stock</p>
                    : <div className="divide-y divide-[#0f0f0f]">
                        {data.alertas_stock.map((a:any) => (
                          <div key={a.id_producto} className="flex items-center gap-3 px-5 py-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium truncate">{a.nombre}</p>
                              <p className="text-[10.5px] text-[#444] font-mono">{a.sku}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[13px] font-black text-[#ef4444]" style={{fontFamily:"var(--font-display)"}}>{a.stock}</p>
                              <p className="text-[10px] text-[#444]">mín {a.minimo}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
