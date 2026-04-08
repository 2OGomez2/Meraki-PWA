import React from 'react';
import { ChevronLeft, Receipt, Users, ArrowRightCircle } from 'lucide-react';

export default function CorteCaja({ alCambiarVista, ventas, alResetearCaja }) {
  const hoy = new Date().toDateString();
  
  // Filtramos solo lo de hoy
  const ventasHoy = ventas.filter(v => {
    const fechaVenta = v.idOrden ? new Date(v.idOrden) : new Date();
    return fechaVenta.toDateString() === hoy;
  });

  const totalCaja = ventasHoy.reduce((acc, v) => acc + (Number(v.totalAcumulado) || 0), 0);

  return (
    <div className="p-6 pb-24 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => alCambiarVista("home")} className="p-2 bg-white rounded-full shadow-sm active:scale-90 transition-all">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-black text-slate-800">Corte de Turno</h2>
      </div>

      {/* Resumen Principal */}
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl mb-6 relative overflow-hidden">
        <Receipt className="absolute -right-4 -top-4 opacity-10" size={100} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-blue-400">Total en Efectivo</p>
        <h1 className="text-5xl font-black mb-2">${totalCaja.toFixed(2)}</h1>
        <div className="flex items-center gap-2 text-slate-400">
          <Users size={16} />
          <span className="text-sm font-bold">{ventasHoy.length} pedidos realizados hoy</span>
        </div>
      </div>

      {/* Detalle de Pedidos */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Desglose de Ventas</h3>
        
        <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
          {ventasHoy.length > 0 ? (
            ventasHoy.map((v, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700 uppercase">{v.cliente || "Cliente"}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{v.horaInicio || "Hora N/A"}</p>
                  </div>
                </div>
                <span className="font-black text-slate-900">${v.totalAcumulado.toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-slate-400 text-sm font-bold italic">No hay ventas registradas este día.</p>
          )}
        </div>
      </div>

      {/* Botón Finalizar */}
      <button 
        onClick={() => {
          if(window.confirm("¿Confirmas el cierre de turno? El historial se mantendrá para el administrador.")) {
            alCambiarVista("home");
          }
        }}
        className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
      >
        Finalizar Turno y Salir <ArrowRightCircle size={18} />
      </button>

      {/* Estilo para el scroll interno */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}