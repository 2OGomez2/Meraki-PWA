import React, { useState } from 'react';
import { 
  ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, 
  Target, ShoppingBag, Info, DollarSign, Settings, 
  XCircle, Save, Check 
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Dashboard({ ventas, gastosFijos, alCambiarVista, alCerrarCaja }) {
  const [efectivoFisico, setEfectivoFisico] = useState("");
  const [ultimoCuadre, setUltimoCuadre] = useState(localStorage.getItem('ultimoCuadre') || "Sin registro");
  const [metaDiaria, setMetaDiaria] = useState(
    parseFloat(localStorage.getItem('metaMeraki')) || (gastosFijos / 0.60)
  );

  // --- LÓGICA DE FILTRADO (EXCLUIR ABONOS) ---
  const ventasReales = ventas.filter(v => v.pagado === true && !v.esPagoParcial);
  
  const totalVentas = ventasReales.reduce((acc, v) => {
    const detalle = v.items || v.pagos?.[0]?.items || [];
    return acc + detalle.reduce((sum, i) => sum + (i.precioUnitario * i.cantidad), 0);
  }, 0);

  const costoInsumosEstimado = totalVentas * 0.40;
  const utilidadNeta = totalVentas - costoInsumosEstimado - gastosFijos;
  const progresoMeta = (totalVentas / metaDiaria) * 100;

  // --- PRODUCTO ESTRELLA Y MENOS VENDIDO (MEJORA 2) ---
  const conteoProductos = {};
  ventasReales.forEach(v => {
    const detalle = v.items || v.pagos?.[0]?.items || [];
    detalle.forEach(i => {
      conteoProductos[i.nombre] = (conteoProductos[i.nombre] || 0) + i.cantidad;
    });
  });

  const sortedProducts = Object.entries(conteoProductos).sort((a,b) => b[1] - a[1]);
  const productoEstrella = sortedProducts[0] || ["N/A", 0];
  const productoMenosVendido = sortedProducts.length > 1 ? sortedProducts[sortedProducts.length - 1] : ["N/A", 0];

  // --- LÓGICA DE CAJA (MEJORA 3: BOTÓN CUADRAR) ---
  const diferenciaCaja = efectivoFisico !== "" ? parseFloat(efectivoFisico) - totalVentas : 0;
  const alertaCaja = Math.abs(diferenciaCaja) > 5;

  const handleCuadrar = () => {
    if (efectivoFisico === "") return Swal.fire("Escribe el efectivo", "", "info");
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setUltimoCuadre(hora);
    localStorage.setItem('ultimoCuadre', hora);
    Swal.fire("¡Caja Cuadrada!", `Diferencia de $${diferenciaCaja.toFixed(2)} a las ${hora}`, "success");
  };

  // --- MEJORA 1: CERRAR DÍA ---
  const handleCerrarDia = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar Operaciones del Día?',
      text: "Esto guardará el resumen final en el historial de reportes.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'SÍ, CERRAR DÍA',
      confirmButtonColor: '#0f172a'
    });

    if (result.isConfirmed) {
      alCerrarCaja({
        totalVentas,
        utilidad: utilidadNeta,
        diferenciaCaja,
        efectivoFisico: parseFloat(efectivoFisico) || 0,
        productoEstrella: productoEstrella[0],
        metaAlcanzada: progresoMeta >= 100
      });
    }
  };

  const ajustarMeta = async () => {
    const { value: nuevaMeta } = await Swal.fire({
      title: 'Ajustar Meta Diaria',
      input: 'number',
      inputValue: metaDiaria,
      showCancelButton: true
    });
    if (nuevaMeta) {
      setMetaDiaria(parseFloat(nuevaMeta));
      localStorage.setItem('metaMeraki', nuevaMeta);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <div className="bg-slate-900 p-6 pt-12 text-white rounded-b-[3rem] shadow-2xl relative">
        <button onClick={() => alCambiarVista("home")} className="mb-4 opacity-50"><ArrowLeft /></button>
        <button onClick={ajustarMeta} className="absolute top-12 right-6 p-2 bg-white/10 rounded-full"><Settings size={20} className="text-blue-400" /></button>
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400 leading-none mb-1">Auditoría Operativa</p>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Meraki Dashboard</h1>
      </div>

      <div className="p-4 -mt-8 space-y-6">
        
        {/* PROGRESO META */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center">
          <div className={`w-24 h-24 rounded-full border-[8px] flex flex-col items-center justify-center mb-3 
            ${progresoMeta >= 100 ? 'border-green-500 text-green-600' : 'border-blue-500 text-blue-600'}`}>
            <span className="text-2xl font-black">{progresoMeta.toFixed(0)}%</span>
          </div>
          <h2 className="text-sm font-black uppercase tracking-tighter italic">Meta: ${metaDiaria.toFixed(2)}</h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
            Vendido: ${totalVentas.toFixed(2)}
          </p>
        </div>

        {/* --- VALIDACIÓN DE CAJA --- */}
        <div className={`p-6 rounded-[2.2rem] shadow-lg border-2 transition-all bg-white ${alertaCaja ? 'border-red-200' : 'border-transparent'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black uppercase text-[10px] text-slate-400 tracking-widest flex items-center gap-2">
              <DollarSign size={14} /> Control de Efectivo
            </h3>
            <span className="text-[9px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 italic">
              Cuadre: {ultimoCuadre}
            </span>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <input 
                type="number"
                placeholder="Efectivo"
                value={efectivoFisico}
                onChange={(e) => setEfectivoFisico(e.target.value)}
                className="w-full bg-slate-100 p-4 rounded-2xl font-black text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleCuadrar}
                className="absolute right-2 top-2 bottom-2 bg-green-600 text-white px-3 rounded-xl flex items-center gap-1 shadow-lg"
              >
                <Check size={16} strokeWidth={4} />
              </button>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center px-2">
            <p className="text-[10px] font-black text-slate-400 uppercase">Diferencia:</p>
            <p className={`text-xl font-black ${alertaCaja ? 'text-red-600' : 'text-green-600'}`}>
              ${diferenciaCaja.toFixed(2)}
            </p>
          </div>
        </div>

        {/* --- PRODUCTO ESTRELLA VS ESTANCADO --- */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[2rem] shadow-lg border-b-4 border-green-500">
            <ShoppingBag size={18} className="text-green-600 mb-2" />
            <p className="text-[9px] font-black text-slate-400 uppercase">Estrella</p>
            <p className="text-xs font-black text-slate-900 uppercase truncate">{productoEstrella[0]}</p>
          </div>
          <div className="bg-white p-5 rounded-[2rem] shadow-lg border-b-4 border-red-500">
            <XCircle size={18} className="text-red-600 mb-2" />
            <p className="text-[9px] font-black text-slate-400 uppercase">Estancado</p>
            <p className="text-xs font-black text-slate-900 uppercase truncate">{productoMenosVendido[0]}</p>
          </div>
        </div>

        {/* UTILIDAD NETA */}
        <div className={`p-6 rounded-[2.5rem] shadow-xl text-white ${utilidadNeta > 0 ? 'bg-slate-900' : 'bg-red-900'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest mb-1">Ganancia Estimada</p>
              <p className="text-4xl font-black italic tracking-tighter">${utilidadNeta.toFixed(2)}</p>
            </div>
            <TrendingUp size={40} className="opacity-20" />
          </div>
        </div>

        {/* --- BOTÓN CERRAR DÍA --- */}
        <button 
          onClick={handleCerrarDia}
          className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-black uppercase shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Save size={20} /> Finalizar Jornada (Cerrar Día)
        </button>

      </div>
    </div>
  );
}