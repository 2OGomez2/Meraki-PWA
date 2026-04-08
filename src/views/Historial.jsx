import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

export default function Historial({ alCambiarVista, ventas }) {
  const [expandeVenta, setExpandeVenta] = useState(null);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => alCambiarVista("home")} className="p-2 bg-white rounded-full shadow-sm"><ChevronLeft size={24} /></button>
        <h2 className="text-2xl font-black">Historial</h2>
      </div>

      {ventas.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold uppercase text-[10px] tracking-widest">No hay ventas registradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ventas.map(v => (
            <div key={v.idOrden} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
              <div onClick={() => setExpandeVenta(expandeVenta === v.idOrden ? null : v.idOrden)} className="p-5 flex justify-between items-center cursor-pointer active:bg-slate-50">
                <div>
                  <h4 className="font-black text-lg text-slate-800">{v.cliente}</h4>
                  <p className="text-[10px] font-bold text-blue-500 uppercase">{v.pagos.length} PAGOS</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black text-slate-900">${v.totalAcumulado.toFixed(2)}</span>
                  {expandeVenta === v.idOrden ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </div>
              </div>
              {expandeVenta === v.idOrden && (
                <div className="bg-slate-50 p-5 border-t border-slate-100 space-y-4">
                  {v.pagos.map((p, idx) => (
                    <div key={idx} className="border-b last:border-0 pb-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pago {idx+1} - {p.hora}</p>
                      {p.items.map(it => <p key={it.id} className="text-xs font-bold text-slate-600">{it.nombre} x{it.cantidad}</p>)}
                      <p className="text-right font-black text-sm text-slate-900">${p.monto.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}