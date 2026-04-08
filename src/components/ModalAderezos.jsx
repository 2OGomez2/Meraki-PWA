import React, { useState } from 'react';
import { X, Plus, Minus, CheckCircle2 } from 'lucide-react';

export default function ModalAderezos({ producto, alFinalizar, alCerrar }) {
  // Estado que guarda cuántos de cada uno lleva: { BBQ: 2, Ranch: 1 }
  const [seleccion, setSeleccion] = useState({});
  const aderezosDisponibles = producto.aderezosDisponibles || ["BBQ", "Búfalo", "Ranch", "Orange"];

  // Calcular totales actuales
  const totalSeleccionado = Object.values(seleccion).reduce((a, b) => a + b, 0);
  const cantidadExtras = Math.max(0, totalSeleccionado - producto.maxAderezosGratis);
  const precioFinal = producto.precioBase + (cantidadExtras * 0.50);

  const ajustarCantidad = (nombre, delta) => {
    setSeleccion(prev => {
      const nuevaCant = (prev[nombre] || 0) + delta;
      if (nuevaCant <= 0) {
        const copia = { ...prev };
        delete copia[nombre];
        return copia;
      }
      return { ...prev, [nombre]: nuevaCant };
    });
  };

  const confirmar = () => {
    if (totalSeleccionado < producto.maxAderezosGratis) {
      alert(`Por favor, selecciona al menos los ${producto.maxAderezosGratis} aderezos incluidos.`);
      return;
    }

    // Formatear el detalle para el carrito
    const listaDetalle = Object.entries(seleccion).map(([nom, cant]) => `${nom} x${cant}`);
    const detalleFinal = `Aderezos: ${listaDetalle.join(", ")} (${cantidadExtras} Extra)`;
    
    alFinalizar(precioFinal, detalleFinal);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado */}
        <div className="bg-slate-50 p-8 text-center border-b">
          <h3 className="text-xl font-black text-slate-800">{producto.nombre}</h3>
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase">
              Gratis: {producto.maxAderezosGratis}
            </span>
            <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase">
              Extras: {cantidadExtras} (+$${(cantidadExtras * 0.5).toFixed(2)})
            </span>
          </div>
        </div>

        {/* Lista de Aderezos con Contadores */}
        <div className="p-6 space-y-4">
          {aderezosDisponibles.map(aderezo => (
            <div key={aderezo} className="flex items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <span className="font-black text-slate-700 ml-2">{aderezo}</span>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => ajustarCantidad(aderezo, -1)}
                  className="w-10 h-10 rounded-full bg-white border shadow-sm flex items-center justify-center text-slate-400 active:scale-90"
                >
                  <Minus size={18} />
                </button>
                
                <span className="font-black text-lg w-4 text-center">
                  {seleccion[aderezo] || 0}
                </span>

                <button 
                  onClick={() => ajustarCantidad(aderezo, 1)}
                  className="w-10 h-10 rounded-full bg-slate-900 text-white shadow-md flex items-center justify-center active:scale-90"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer con Total y Confirmación */}
        <div className="p-8 bg-white border-t">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total Línea</span>
            <span className="text-3xl font-black text-slate-900">${precioFinal.toFixed(2)}</span>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={alCerrar}
              className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest"
            >
              Cancelar
            </button>
            <button 
              onClick={confirmar}
              className="flex-[2] bg-green-600 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-lg shadow-green-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <CheckCircle2 size={18} /> Agregar al Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}