import React from 'react';
import { ChevronLeft, DollarSign, TrendingUp, Calendar, ShoppingBag, BarChart3 } from 'lucide-react';

export default function Dashboard({ alCambiarVista, ventas }) {
  const hoy = new Date();

  // --- LÓGICA DE CÁLCULO MEJORADA ---
  const calcularVenta = (periodo) => {
    return ventas.reduce((total, v) => {
      // Usamos el timestamp idOrden para la fecha
      const fechaVenta = v.idOrden ? new Date(v.idOrden) : new Date();
      if (isNaN(fechaVenta.getTime())) return total;

      let cumple = false;

      if (periodo === 'dia') {
        cumple = fechaVenta.toDateString() === hoy.toDateString();
      }
      if (periodo === 'ayer') {
        const ayer = new Date();
        ayer.setDate(hoy.getDate() - 1);
        cumple = fechaVenta.toDateString() === ayer.toDateString();
      }
      if (periodo === 'mes_actual') {
        cumple = fechaVenta.getMonth() === hoy.getMonth() && 
                 fechaVenta.getFullYear() === hoy.getFullYear();
      }
      if (periodo === 'mes_pasado') {
        const mesPasado = hoy.getMonth() === 0 ? 11 : hoy.getMonth() - 1;
        const anioCorrespondiente = hoy.getMonth() === 0 ? hoy.getFullYear() - 1 : hoy.getFullYear();
        cumple = fechaVenta.getMonth() === mesPasado && 
                 fechaVenta.getFullYear() === anioCorrespondiente;
      }

      return cumple ? total + (Number(v.totalAcumulado) || 0) : total;
    }, 0);
  };

  // Variables de resultados
  const ventaDia = calcularVenta('dia');
  const ventaAyer = calcularVenta('ayer');
  const ventaMes = calcularVenta('mes_actual');
  const ventaMesPasado = calcularVenta('mes_pasado');

  return (
    <div className="p-6 pb-24 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => alCambiarVista("home")} className="p-2 bg-white rounded-full shadow-sm active:scale-90 transition-all">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Panel de Control</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Análisis de Meraki</p>
        </div>
      </div>

      <div className="grid gap-6">
        
        {/* Tarjeta Principal: Hoy vs Ayer */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <BarChart3 className="absolute -right-6 -bottom-6 opacity-10" size={180} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-blue-400">Venta de Hoy</p>
          <h1 className="text-5xl font-black mb-4">${ventaDia.toFixed(2)}</h1>
          <div className="flex items-center gap-2 bg-white/10 w-fit px-4 py-2 rounded-full">
            <TrendingUp size={14} className={ventaDia >= ventaAyer ? "text-green-400" : "text-red-400"} />
            <span className="text-xs font-bold">Ayer: ${ventaAyer.toFixed(2)}</span>
          </div>
        </div>

        {/* Comparativa Mensual */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <Calendar className="text-blue-600 mb-2" size={24} />
            <p className="text-[9px] font-black text-slate-400 uppercase">Mes Actual</p>
            <p className="text-xl font-black text-slate-800">${ventaMes.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm opacity-80">
            <Calendar className="text-slate-400 mb-2" size={24} />
            <p className="text-[9px] font-black text-slate-400 uppercase">Mes Pasado</p>
            <p className="text-xl font-black text-slate-600">${ventaMesPasado.toFixed(2)}</p>
          </div>
        </div>

        {/* Estadísticas de Salud del Negocio */}
        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="text-slate-800" />
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Métricas Globales</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Órdenes en Historial</p>
                <p className="text-2xl font-black text-slate-900">{ventas.length}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Ticket Promedio</p>
                <p className="text-2xl font-black text-blue-600">
                  ${ventas.length > 0 ? (ventaMes / (ventas.filter(v => new Date(v.idOrden).getMonth() === hoy.getMonth()).length || 1)).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>

            {/* Barra de Proyección Visual Simple */}
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-black uppercase">
                  <span>Meta Mensual (Ej: $1000)</span>
                  <span>{((ventaMes/1000)*100).toFixed(0)}%</span>
               </div>
               <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((ventaMes/1000)*100, 100)}%` }}
                  ></div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}