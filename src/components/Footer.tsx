import Link from "next/link";
export default function Footer() {
  return (
    <footer className="border-t border-[#111] mt-20" style={{background:"#060606"}}>
      <div className="container py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-[13px] text-black" style={{background:"var(--gold)",fontFamily:"var(--font-display)"}}>CS</div>
            <div><div className="text-[13px] font-bold text-white" style={{fontFamily:"var(--font-display)"}}>Copy Systems</div><div className="text-[9px] tracking-[.18em] uppercase" style={{color:"var(--gold)"}}>E.I.R.L.</div></div>
          </div>
          <p className="text-[12.5px] text-[#444] leading-relaxed">Especialistas en equipos de impresión y soluciones de oficina. Más de 10 años en Huancayo.</p>
        </div>
        {[
          { titulo:"Productos", links:[["Fotocopiadoras","?categoria=1"],["Impresoras","?categoria=3"],["Insumos","?categoria=2"],["Accesorios","?categoria=5"]] },
          { titulo:"Empresa",   links:[["Quiénes Somos","/nosotros"],["Servicio Técnico","/servicios"],["Garantías","/garantias"],["Contacto","/contacto"]] },
        ].map(col => (
          <div key={col.titulo}>
            <h4 className="text-[10px] font-bold tracking-[.15em] uppercase text-[#444] mb-3.5" style={{fontFamily:"var(--font-display)"}}>{col.titulo}</h4>
            <ul className="flex flex-col gap-2">
              {col.links.map(([l,h]) => <li key={l}><Link href={col.titulo==="Productos"?`/productos${h}`:h} className="text-[12.5px] text-[#444] hover:text-[#F5C200] transition-colors">{l}</Link></li>)}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="text-[10px] font-bold tracking-[.15em] uppercase text-[#444] mb-3.5" style={{fontFamily:"var(--font-display)"}}>Contacto</h4>
          <ul className="flex flex-col gap-2 text-[12.5px] text-[#444]">
            <li>📍 Jr. Lima 123, Huancayo</li><li>📞 (064) 123-4567</li>
            <li>📱 +51 987 654 321</li><li>✉ ventas@copysystems.com.pe</li>
            <li>🕐 Lun–Sáb: 9:00–19:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#0f0f0f]">
        <div className="container py-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-[#2a2a2a]">© {new Date().getFullYear()} Copy Systems E.I.R.L.</p>
          <span className="text-[10.5px] text-[#222] font-mono">RUC: 20123456789</span>
        </div>
      </div>
    </footer>
  );
}
