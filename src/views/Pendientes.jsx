import React from 'react';
import { Check, Clock, User, MessageSquare, PlusCircle } from 'lucide-react';

export default function Pendientes({ ordenes, alFinalizarPago }) {

  // FUNCIÓN AUXILIAR: Convierte formato "21:40" a "9:40 PM"
  const formatearA12Horas = (hora24) => {
    if (!hora24) return "--:--";
    
    // Si por alguna razón ya viene con AM/PM o texto extra, lo devolvemos tal cual
    if (hora24.includes('AM') || hora24.includes('PM')) return hora24;

    try {
      // Dividimos la hora y los minutos (ej: "21:40" -> ["21", "40"])
      const [horasStr, minutosStr] = hora24.split(':');
      let horas = parseInt(horasStr, 10);
      
      // Determinamos si es AM o PM
      const ampm = horas >= 12 ? 'PM' : 'AM';
      
      // Convertimos el rango de 0-23 a 1-12
      horas = horas % 12;
      horas = horas ? horas : 12; // Si da 0, lo transformamos a las 12
      
      return `${horas}:${minutosStr} ${ampm}`;
    } catch (error) {
      return hora24; // En caso de fallo imprevisto, no rompe la app y muestra el dato crudo
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tighter uppercase italic">Órdenes por Preparar</h2>
      
      {ordenes.length === 0 && (
        <div className="text-center p-10 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold uppercase text-xs italic">No hay pedidos pendientes. ¡A descansar, Inge!</p>
        </div>
      )}

      {ordenes.map((orden) => (
        <div key={orden.idFB} className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100">
          {/* Header de la Tarjeta */}
          <div className="flex justify-between items-start mb-4">
            <div>
              {/* Cambiado a color Rosa Meraki (#f4244c) para mantener consistencia de marca */}
              <div className="flex items-center gap-2 text-[#f4244c] mb-1">
                <User size={16} />
                <span className="font-black uppercase text-sm tracking-wider">{orden.cliente}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Clock size={14} />
                {/* APLICACIÓN DE LA CONVERSIÓN DE HORA AQUÍ */}
                <span className="font-bold">Pedido a las {formatearA12Horas(orden.hora)}</span>
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
                  <span className="font-bold text-slate-800 text-sm uppercase">
                    {/* Cantidades también ajustadas al color de Meraki */}
                    <span className="text-[#f4244c] mr-2 font-black">{item.cantidad}x</span> 
                    {item.nombre}
                  </span>
                  {!item.esExtra && <span className="text-xs font-bold text-slate-400">${(item.precioUnitario * item.cantidad).toFixed(2)}</span>}
                </div>

                {/* --- NUEVA SECCIÓN DE ADEREZOS PARA MERAKI --- */}
                {item.aderezos && item.aderezos.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] font-black text-amber-600 uppercase bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                      Aderezos: {item.aderezos.join(', ')}
                    </span>
                  </div>
                )}
                
                {/* Mostrar Notas si existen (Ej: Combo, Aderezo) */}
                {item.nota && (
                  <div className="flex items-center gap-1 mt-1 text-slate-500 italic text-xs">
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
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
            <Check size={20} className="text-green-400" /> 
            ORDEN LISTA (PASAR A PAGO)
          </button>
        </div>
      ))}
    </div>
  );
}