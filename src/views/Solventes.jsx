import React from 'react';
import { CheckCircle, Receipt } from 'lucide-react';

export default function Solventes({ ventasFinalizadas }) {
  if (!ventasFinalizadas || ventasFinalizadas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <CheckCircle size={64} className="mb-4 opacity-10" />
        <p className="font-black uppercase tracking-widest text-xs italic text-center">No hay cobros realizados aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase">Ventas Pagadas</h2>
        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black">
          {ventasFinalizadas.length} TICKETS
        </span>
      </div>

      {ventasFinalizadas.map((venta) => {
        // CORRECCIÓN: Primero buscamos en pagos (donde están los extras) y luego en items.
        const detalleProductos = venta.pagos?.[0]?.items || venta.items || [];
        
        // CÁLCULO DINÁMICO DEL TOTAL
        const sumaTotalReal = detalleProductos.reduce((acc, item) => 
          acc + (item.precioUnitario * item.cantidad), 0
        );

        return (
          <div key={venta.idFB} className="bg-white rounded-[2rem] shadow-md border border-slate-100 overflow-hidden mb-4">
            <div className="bg-green-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase leading-none tracking-tighter">
                    {venta.cliente}
                  </h3>
                  <p className="text-[9px] font-bold opacity-80 mt-1 uppercase">
                    {venta.horaFinalizacion || "Hoy"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-xl leading-none">$ {sumaTotalReal.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50">
              <div className="space-y-1">
                {detalleProductos.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-slate-500 font-bold border-b border-slate-100 pb-1">
                    <span>{item.cantidad}x {item.nombre}</span>
                    <span className="text-slate-700">${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                <span className="text-[8px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase tracking-widest">
                  {venta.esPagoParcial ? "Abono Parcial" : "Pago Completo"}
                </span>
                <span className="text-[8px] font-bold text-slate-300 italic">
                    Ref: {venta.idFB.slice(-5)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}