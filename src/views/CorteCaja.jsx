import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, Receipt, ChevronRight } from 'lucide-react';

export default function CorteCaja({ ventas, alCambiarVista }) {
  const [corte, setCorte] = useState({
    totalEfectivo: 0,
    cantidadVentas: 0,
    detalles: []
  });

  useEffect(() => {
    // FILTRAMOS: Solo nos interesan registros que tengan pagado: true
    const ventasPagadas = ventas.filter(v => v.pagado === true);

    const calculo = ventasPagadas.reduce((acc, venta) => {
      // Usamos la misma lógica de suma dinámica que en Solventes para que el Corte sea exacto
      const detalleProductos = venta.items || venta.pagos?.[0]?.items || [];
      const totalVenta = detalleProductos.reduce((sum, item) => 
        sum + (item.precioUnitario * item.cantidad), 0
      );

      return {
        totalEfectivo: acc.totalEfectivo + totalVenta,
        cantidadVentas: acc.cantidadVentas + 1,
        detalles: [...acc.detalles, { 
          cliente: venta.cliente, 
          monto: totalVenta, 
          hora: venta.horaFinalizacion,
          esAbono: venta.esPagoParcial 
        }]
      };
    }, { totalEfectivo: 0, cantidadVentas: 0, detalles: [] });

    setCorte(calculo);
  }, [ventas]);

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* HEADER DINÁMICO */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Calculator size={120} />
        </div>
        
        <div className="relative z-10">
          <p className="text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase mb-2">Total en Caja (Hoy)</p>
          <h2 className="text-5xl font-black tracking-tighter flex items-start">
            <span className="text-2xl mt-1 mr-1 text-blue-400">$</span>
            {corte.totalEfectivo.toFixed(2)}
          </h2>
          
          <div className="flex gap-4 mt-6">
            <div className="bg-white/10 px-4 py-2 rounded-2xl">
              <p className="text-[8px] font-bold text-slate-400 uppercase">Ventas/Tickets</p>
              <p className="font-black text-lg">{corte.cantidadVentas}</p>
            </div>
            <div className="bg-blue-600/30 px-4 py-2 rounded-2xl border border-blue-500/30">
              <p className="text-[8px] font-bold text-blue-300 uppercase">Estado</p>
              <p className="font-black text-lg italic uppercase">Cuadrado</p>
            </div>
          </div>
        </div>
      </div>

      {/* DESGLOSE DE MOVIMIENTOS */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-black text-slate-800 uppercase italic text-sm tracking-tighter">Resumen de Entradas</h3>
          <TrendingUp size={16} className="text-green-500" />
        </div>

        <div className="bg-white rounded-[2rem] p-4 shadow-xl border border-slate-100 divide-y divide-slate-50">
          {corte.detalles.length === 0 ? (
            <p className="text-center py-6 text-slate-400 text-xs font-bold uppercase italic">Sin movimientos registrados</p>
          ) : (
            corte.detalles.map((mov, idx) => (
              <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${mov.esAbono ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Receipt size={16} />
                  </div>
                  <div>
                    <p className="font-black text-[11px] text-slate-800 uppercase leading-none">{mov.cliente}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1">{mov.hora || '---'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${mov.esAbono ? 'text-amber-600' : 'text-slate-900'}`}>
                    + ${mov.monto.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="grid grid-cols-1 gap-3 pt-4">
        <button 
          onClick={() => window.print()} 
          className="bg-white border-2 border-slate-900 text-slate-900 p-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <ChevronRight size={16} className="rotate-90" /> Exportar Reporte (PDF)
        </button>
        
        <button 
          onClick={() => alCambiarVista("dashboard")}
          className="bg-blue-600 text-white p-5 rounded-[1.5rem] font-black text-sm uppercase tracking-tighter shadow-blue-200 shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          Ver Analíticas Avanzadas <TrendingUp size={18} />
        </button>
      </div>
    </div>
  );
}