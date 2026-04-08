import React from 'react';
import { X, ShoppingBag } from 'lucide-react';

export default function ModalPartirCuenta({ orden, carritoParcial, alCerrar, alToggleItem, alFinalizar }) {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-800">Partir Cuenta</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Mesa: {orden.cliente}</p>
          </div>
          <button onClick={alCerrar} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
        </div>

        <div className="space-y-2 mb-6 max-h-[40vh] overflow-y-auto pr-2">
          {orden.items.map(item => {
            const seleccionado = carritoParcial.find(i => i.id === item.id);
            return (
              <button 
                key={item.id} 
                onClick={() => alToggleItem(item)}
                className={`w-full flex justify-between items-center p-5 rounded-2xl border-2 transition-all ${seleccionado ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}
              >
                <div className="text-left">
                  <p className={`font-black ${seleccionado ? 'text-blue-700' : 'text-slate-600'}`}>{item.nombre} x{item.cantidad}</p>
                  {seleccionado && <p className="text-[10px] font-bold text-blue-500 uppercase">PAGANDO: {seleccionado.cantidad}</p>}
                </div>
                <span className="font-black">${(item.precioUnitario * (seleccionado?.cantidad || 1)).toFixed(2)}</span>
              </button>
            );
          })}
        </div>

        <div className="border-t pt-6">
          <button 
            disabled={carritoParcial.length === 0}
            onClick={alFinalizar}
            className="w-full bg-green-600 disabled:bg-slate-300 text-white py-5 rounded-2xl font-black uppercase flex items-center justify-center gap-3"
          >
            <ShoppingBag size={20} /> Finalizar Cobro
          </button>
        </div>
      </div>
    </div>
  );
}