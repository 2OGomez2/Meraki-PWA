import React from 'react';
import { Check, Clock, User, MessageSquare, PlusCircle } from 'lucide-react';

export default function Pendientes({ ordenes, alFinalizarPago }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-slate-800 mb-6">Órdenes por Preparar</h2>
      
      {ordenes.length === 0 && (
        <div className="text-center p-10 bg-white rounded-[2rem] border-2 border-dashed">
          <p className="text-slate-400 font-bold">No hay pedidos pendientes. ¡A descansar, Inge!</p>
        </div>
      )}

      {ordenes.map((orden) => (
        <div key={orden.idFB} className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100">
          {/* Header de la Tarjeta */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <User size={16} />
                <span className="font-black uppercase text-sm tracking-wider">{orden.cliente}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Clock size={14} />
                <span>Pedido a las {orden.hora}</span>
              </div>
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-2xl">
              <span className="font-black text-slate-700 text-lg">${orden.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Listado Detallado de Items */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-3xl mb-6">
            {orden.items.map((item, idx) => (
              <div key={idx} className="flex flex-col border-b border-slate-200 last:border-0 pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">
                    <span className="text-blue-600 mr-2">{item.cantidad}x</span> 
                    {item.nombre}
                  </span>
                  {!item.esExtra && <span className="text-xs font-bold text-slate-400">$${(item.precioUnitario * item.cantidad).toFixed(2)}</span>}
                </div>
                
                {/* Mostrar Notas si existen (Ej: Combo, Aderezo) */}
                {item.nota && (
                  <div className="flex items-center gap-1 mt-1 text-blue-500 italic text-sm">
                    <MessageSquare size={12} />
                    <span>{item.nota}</span>
                  </div>
                )}

                {/* Resaltar si es un EXTRA LIBRE */}
                {item.esExtra && (
                  <div className="mt-1 inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-[10px] font-black w-fit uppercase">
                    <PlusCircle size={10} /> Extra Agregado: ${item.precioUnitario.toFixed(2)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Botón de Acción Principal */}
          <button 
            onClick={() => alFinalizarPago(orden, orden.items, false)}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
          >
            <Check size={20} className="text-green-400" /> 
            ORDEN LISTA (PASAR A PAGO)
          </button>
        </div>
      ))}
    </div>
  );
}