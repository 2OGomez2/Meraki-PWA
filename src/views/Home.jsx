import React from 'react';
// Agregamos TrendingUp a la lista de iconos importados
import { PlusCircle, Clock, CheckCircle, Calculator, TrendingUp } from 'lucide-react';

export default function Home({ alCambiarVista, cantidadPendientes }) {
  return (
    <div className="grid grid-cols-2 gap-4 p-6 h-[90vh] items-center">
      
      {/* Botón Tomar Orden */}
      <button onClick={() => alCambiarVista("tomar")} className="h-44 bg-slate-900 text-white rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-xl active:scale-95 transition-all">
        <PlusCircle size={40} />
        <span className="font-black text-xs uppercase tracking-widest text-center">Tomar Orden</span>
      </button>

      {/* Botón Pendientes */}
      <button onClick={() => alCambiarVista("pendientes")} className="h-44 bg-blue-600 text-white rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-xl relative active:scale-95 transition-all">
        <Clock size={40} />
        <span className="font-black text-xs uppercase tracking-widest text-center">Pendientes</span>
        {cantidadPendientes > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-4 border-slate-50 animate-bounce">
            {cantidadPendientes}
          </span>
        )}
      </button>

      {/* Botón Historial */}
      <button onClick={() => alCambiarVista("historial")} className="h-44 bg-white border-2 rounded-[2rem] flex flex-col items-center justify-center gap-4 active:scale-95 transition-all">
        <CheckCircle size={40} className="text-green-500" />
        <span className="font-black text-xs uppercase tracking-widest text-center">Historial</span>
      </button>

      {/* Botón Corte Caja */}
      <button onClick={() => alCambiarVista("corte")} className="h-44 bg-white border-2 rounded-[2rem] flex flex-col items-center justify-center gap-4 active:scale-95 transition-all">
        <Calculator size={40} className="text-yellow-600" />
        <span className="font-black text-xs uppercase tracking-widest text-center">Corte Caja</span>
      </button>

      {/* Botón Dashboard Administrativo (Ocupa las 2 columnas) */}
      <button 
        onClick={() => {
          const pin = prompt("Ingrese PIN de Administrador:");
          if(pin === "1234") alCambiarVista("dashboard");
          else alert("PIN Incorrecto, chero.");
        }} 
        className="col-span-2 h-24 bg-white border-2 border-slate-100 rounded-[2rem] flex items-center justify-center gap-4 active:scale-95 transition-all"
      >
        <TrendingUp className="text-blue-600" size={24} />
        <span className="font-black text-xs uppercase tracking-widest text-slate-600">Dashboard Administrativo</span>
      </button>

    </div>
  );
}