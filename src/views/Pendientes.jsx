import React from 'react';
import { Check, Clock, User, MessageSquare, PlusCircle } from 'lucide-react';

export default function Pendientes({ ordenes, alFinalizarPago }) {

  // FUNCIÓN AUXILIAR: Convierte formato "21:40" a "9:40 PM"
  const formatearA12Horas = (hora24) => {
    if (!hora24) return "--:--";
    
    if (hora24.includes('AM') || hora24.includes('PM')) return hora24;

    try {
      const [horasStr, minutosStr] = hora24.split(':');
      let horas = parseInt(horasStr, 10);
      
      const ampm = horas >= 12 ? 'PM' : 'AM';
      
      horas = horas % 12;
      horas = horas ? horas : 12; 
      
      return `${horas}:${minutosStr} ${ampm}`;
    } catch (error) {
      return hora24; 
    }
  };

  return (
    <div className="space-y-6 p-2 min-h-[88vh]" style={{ backgroundColor: '#FFF8F0' }}>
      <h2 
        className="text-2xl font-black mb-6 tracking-tighter uppercase italic"
        style={{ color: '#4A4A4A', fontFamily: '"Nunito", "Fredoka One", sans-serif' }}
      >
        Órdenes por Preparar
      </h2>
      
      {ordenes.length === 0 && (
        <div 
          className="text-center p-10 rounded-[2.5rem] border-2 border-dashed"
          style={{ backgroundColor: '#FFEBD9', borderColor: '#FF4081' }}
        >
          <p className="font-black uppercase text-xs italic" style={{ color: '#4A4A4A' }}>
            No hay pedidos pendientes.
          </p>
        </div>
      )}

      {ordenes.map((orden) => (
        <div 
          key={orden.idFB} 
          className="rounded-[2.5rem] p-6 border"
          style={{ 
            backgroundColor: '#FFEBD9', 
            borderColor: '#FFEBD9',
            boxShadow: '0 4px 10px rgba(255, 180, 150, 0.2)' 
          }}
        >
          {/* Header de la Tarjeta */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1" style={{ color: '#FF4081' }}>
                <User size={16} />
                <span className="font-black uppercase text-sm tracking-wider" style={{ fontFamily: '"Nunito", sans-serif' }}>
                  {orden.cliente}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#4A4A4A', opacity: 0.8 }}>
                <Clock size={14} />
                <span className="font-bold">Pedido a las {formatearA12Horas(orden.hora)}</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/50">
              <span className="font-black text-lg" style={{ color: '#4A4A4A', fontFamily: '"Fredoka One", sans-serif' }}>
                ${orden.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Listado Detallado de Items */}
          <div className="space-y-3 p-4 rounded-3xl mb-6 bg-white/60">
            {orden.items.map((item, idx) => (
              <div key={idx} className="flex flex-col border-b last:border-0 pb-2" style={{ borderColor: '#FFF8F0' }}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm uppercase" style={{ color: '#4A4A4A' }}>
                    <span className="mr-2 font-black" style={{ color: '#FF4081' }}>{item.cantidad}x</span> 
                    {item.nombre}
                  </span>
                  {!item.esExtra && (
                    <span className="text-xs font-bold" style={{ color: '#4A4A4A', opacity: 0.7 }}>
                      ${(item.precioUnitario * item.cantidad).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* --- SECCIÓN DE ADEREZOS --- */}
                {item.aderezos && item.aderezos.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span 
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md border"
                      style={{ backgroundColor: '#FFF8F0', borderColor: '#FFEBD9', color: '#E6144A' }}
                    >
                      Aderezos: {item.aderezos.join(', ')}
                    </span>
                  </div>
                )}
                
                {/* Notas de Cocina */}
                {item.nota && (
                  <div className="flex items-center gap-1 mt-1 italic text-xs font-semibold" style={{ color: '#E6144A' }}>
                    <MessageSquare size={12} />
                    <span>{item.nota}</span>
                  </div>
                )}

                {/* EXTRA LIBRE */}
                {item.esExtra && (
                  <div 
                    className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black w-fit uppercase border"
                    style={{ backgroundColor: '#FFF8F0', borderColor: '#34C759', color: '#34C759' }}
                  >
                    <PlusCircle size={10} /> Extra Agregado: ${item.precioUnitario.toFixed(2)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Botón de Acción Principal (Rosa Fucsia) */}
          <button 
            onClick={() => alFinalizarPago(orden, orden.items, false)}
            className="w-full text-white py-4 rounded-3xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-md"
            style={{ 
              backgroundColor: '#FF4081',
              boxShadow: '0 4px 12px rgba(255, 64, 129, 0.3)',
              fontFamily: '"Nunito", "Fredoka One", sans-serif'
            }}
          >
            <Check size={20} className="text-white" /> 
            ORDEN LISTA (PASAR A PAGO)
          </button>
        </div>
      ))}
    </div>
  );
}