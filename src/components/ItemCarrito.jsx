import React from 'react';
import { Trash2 } from 'lucide-react';

export default function ItemCarrito({ item, alEliminar }) {
  return (
    <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
      <div>
        <p className="font-black">{item.nombre} <span className="text-blue-600">x{item.cantidad}</span></p>
        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.detalle}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-black">${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
        <button onClick={() => alEliminar(item.id)} className="text-red-400 p-2">
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}