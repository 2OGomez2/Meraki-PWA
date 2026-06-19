import React, { useState, useEffect } from 'react';
import { Lock, BarChart3, Edit3, ShieldAlert, ArrowLeft, ArrowRight, Trash2, Edit } from 'lucide-react';
import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { db } from "../firebaseConfig";
import GestionMenu from '../views/GestionMenu';

export default function Administracion({ alCambiarVista }) {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  const [pestanaActiva, setPestanaActiva] = useState('dashboard');

  // Estados Globales de Datos Reales
  const [ventasTotales, setVentasTotales] = useState([]);
  const [gastosTotales, setGastosTotales] = useState([]);
  const [productosMenu, setProductosMenu] = useState([]);
  const [metasDelDia, setMetasDelDia] = useState({});

  // Validar credenciales
  const manejarAcceso = (e) => {
    e.preventDefault();
    if (password === 'owen') {
      setAutenticado(true);
    } else {
      Swal.fire('Acceso Denegado', 'Contraseña incorrecta', 'error');
    }
  };

  // Escuchar colecciones globales de Firebase en tiempo real
  useEffect(() => {
    if (!autenticado) return;

    const unsubsVentas = onSnapshot(collection(db, 'historial'), (snap) => {
      const datosVentas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log("🔥 DATOS DE VENTAS EN FIREBASE:", datosVentas);
      setVentasTotales(datosVentas);
    });
    const unsubsGastos = onSnapshot(collection(db, 'gastos'), (snap) => {
      setGastosTotales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubsMenu = onSnapshot(collection(db, 'menu'), (snap) => {
      setProductosMenu(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubsMetas = onSnapshot(collection(db, 'metas'), (snap) => {
      const objMetas = {};
      snap.docs.forEach(d => { objMetas[d.id] = d.data().meta; });
      setMetasDelDia(objMetas);
    });

    return () => { unsubsVentas(); unsubsGastos(); unsubsMenu(); unsubsMetas(); };
  }, [autenticado]);

  if (!autenticado) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#f4244c]">
          <Lock size={28} />
        </div>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight italic mb-2">ÁREA RESTRINGIDA</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Ingresa el PIN de Administrator</p>
        <form onSubmit={manejarAcceso} className="space-y-4">
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full tracking-widest text-center py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-black outline-none focus:border-[#f4244c] transition-all"
            required
          />
          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all">
            Validar Identidad
          </button>
        </form>

        <button 
          onClick={() => alCambiarVista("tomar")} 
          className="w-full mt-3 text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest text-center transition-all"
        >
          &larr; Volver al Menú
        </button>
      </div>
    );
  }

  return (
    // pb-28 evita que el contenido de los dashboards o tablas quede tapado por el menú estático
    <div className="space-y-6 p-2 pb-28 relative">
      
      {/* =========================================================
          RENDERIZADO CONDICIONAL DE LAS PESTAÑAS INTERNAS
          ========================================================= */}
      {pestanaActiva === 'dashboard' && <SubSeccionDashboard ventas={ventasTotales} gastos={gastosTotales} metas={metasDelDia} />}
      
      {pestanaActiva === 'menu' && <GestionMenu productos={productosMenu} />}
      
      {pestanaActiva === 'listaGastos' && <SubSeccionListaGastos gastos={gastosTotales} />}

      {/* =========================================================
          BARRA DE NAVEGACIÓN ESTÁTICA INFERIOR (BOTTOM NAV BAR)
          ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.2)] border-t border-slate-800/60 backdrop-blur-md">
        <div className="flex max-w-md mx-auto bg-slate-900 p-1.5 rounded-2xl justify-between gap-1">
          <button 
            onClick={() => setPestanaActiva('dashboard')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${pestanaActiva === 'dashboard' ? 'bg-[#f4244c] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <BarChart3 size={15} />
            <span className="text-[9px] sm:text-[10px]">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setPestanaActiva('menu')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${pestanaActiva === 'menu' ? 'bg-[#f4244c] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <Edit3 size={15} />
            <span className="text-[9px] sm:text-[10px]">Menú</span>
          </button>
          
          <button 
            onClick={() => setPestanaActiva('listaGastos')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${pestanaActiva === 'listaGastos' ? 'bg-[#f4244c] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <ShieldAlert size={15} />
            <span className="text-[9px] sm:text-[10px] text-center leading-none">Auditoría Gastos</span>
          </button>
        </div>
      </div>

    </div>
  );
}

// ────────────────────────────────────────────────────────
// SUB-SECCIÓN A: DASHBOARD DINÁMICO
// ────────────────────────────────────────────────────────
function SubSeccionDashboard({ ventas, gastos, metas }) {
  const obtenerFechaLocal = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  const [fechaFiltro, setFechaFiltro] = useState(obtenerFechaLocal());
  const [metaInput, setMetaInput] = useState('');
  const [modalMesAbierto, setModalMesAbierto] = useState(false);

  useEffect(() => {
    setMetaInput(metas[fechaFiltro] || '');
  }, [fechaFiltro, metas]);

  const cambiarDia = (offset) => {
    const d = new Date(fechaFiltro + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    setFechaFiltro(d.toISOString().split('T')[0]);
  };

  const guardarMeta = async (valor) => {
    setMetaInput(valor);
    try {
      await setDoc(doc(db, 'metas', fechaFiltro), { meta: parseFloat(valor) || 0 });
    } catch (e) { console.error(e); }
  };

  const transformarIdAFechaTexto = (idNum) => {
    if (!idNum || typeof idNum !== 'number') return '';
    const fechaOrden = new Date(idNum);
    const anio = fechaOrden.getFullYear();
    const mes = String(fechaOrden.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaOrden.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  };

  const ventasDia = ventas.filter(v => {
    const fechaFormateada = transformarIdAFechaTexto(v.id);
    return fechaFormateada === fechaFiltro;
  });

  const ingresos = ventasDia.reduce((acc, curr) => {
    const dinero = curr.totalAcumulado || curr.montoPagado || curr.total || 0;
    return acc + parseFloat(dinero);
  }, 0);
  
  const gastosDia = gastos.filter(g => g.fecha === fechaFiltro);
  const egresos = gastosDia.reduce((acc, curr) => acc + curr.monto, 0);

  const resultadoDia = ingresos - egresos;
  const metaEstablecida = parseFloat(metas[fechaFiltro]) || 0;
  const vsMeta = resultadoDia - metaEstablecida;

  const obtenerFechaFormateada = (strFecha) => {
    const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(strFecha + 'T00:00:00').toLocaleDateString('es-ES', opciones);
  };

  const obtenerResumenMensual = () => {
    const registros = {};
    const [year, month] = fechaFiltro.split('-');
    
    ventas.forEach(v => {
      const fechaTexto = transformarIdAFechaTexto(v.id);
      if (fechaTexto && fechaTexto.startsWith(`${year}-${month}`)) {
        if (!registros[fechaTexto]) registros[fechaTexto] = { ingresos: 0, egresos: 0 };
        const dineroVenta = v.totalAcumulado || v.montoPagado || v.total || 0;
        registros[fechaTexto].ingresos += parseFloat(dineroVenta);
      }
    });

    gastos.forEach(g => {
      if (g.fecha && g.fecha.startsWith(`${year}-${month}`)) {
        if (!registros[g.fecha]) registros[g.fecha] = { ingresos: 0, egresos: 0 };
        registros[g.fecha].egresos += g.monto;
      }
    });

    return Object.keys(registros).sort().map(f => ({
      fecha: f,
      ingresos: registros[f].ingresos,
      egresos: registros[f].egresos,
      resultado: registros[f].ingresos - registros[f].egresos
    }));
  };

  const resumenMes = obtenerResumenMensual();
  const totalIngresosMes = resumenMes.reduce((a, c) => a + c.ingresos, 0);
  const totalEgresosMes = resumenMes.reduce((a, c) => a + c.egresos, 0);

  return (
    <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
        <button onClick={() => cambiarDia(-1)} className="p-2 hover:bg-slate-800 rounded-lg"><ArrowLeft size={16}/></button>
        <span className="font-black text-xs uppercase tracking-wide text-center">{obtenerFechaFormateada(fechaFiltro)}</span>
        <button onClick={() => cambiarDia(1)} className="p-2 hover:bg-slate-800 rounded-lg"><ArrowRight size={16}/></button>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">🎯 Meta del día:</span>
          <div className="relative max-w-[120px]">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">$</span>
            <input 
              type="number" 
              value={metaInput}
              onChange={(e) => guardarMeta(e.target.value)}
              placeholder="0.00"
              className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-black text-slate-800 text-sm outline-none text-right"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold text-slate-600">
            <span>💰 INGRESOS (VENTAS):</span>
            <span className="text-green-600 font-black">${ingresos.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-600">
            <span>💸 EGRESOS (GASTOS):</span>
            <span className="text-rose-600 font-black">-${egresos.toFixed(2)}</span>
          </div>
          <hr className="border-dashed border-slate-200 my-2" />
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
            <span className="text-xs font-black text-slate-700 uppercase">✅ RESULTADO DEL DÍA:</span>
            <span className={`font-black text-lg ${resultadoDia >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ${resultadoDia.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-400 px-3">
            <span>📊 VS META:</span>
            <span className={`font-black ${vsMeta >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {vsMeta >= 0 ? '+' : ''}${vsMeta.toFixed(2)}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setModalMesAbierto(true)}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest text-center transition-all mt-4"
        >
          📊 Ver Resumen del Mes
        </button>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              🎟️ Tickets Cerrados ({ventasDia.filter(v => v.pagado === true).length})
            </h3>
          </div>

          {ventasDia.filter(v => v.pagado === true).length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-[11px] font-bold uppercase tracking-wider bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No hay tickets en este día
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
              {ventasDia
                .filter(v => v.pagado === true)
                .map((ticket) => {
                  const montoFinal = ticket.totalAcumulado || ticket.montoPagado || ticket.total || 0;
                  return (
                    <div 
                      key={ticket.id} 
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                          {ticket.cliente}
                        </span>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-tight">
                          🕒 {ticket.horaFinalizacion || ticket.hora || "Cerrado"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-600 block">
                            ${parseFloat(montoFinal).toFixed(2)}
                          </span>
                          {ticket.conteoCobros > 0 && (
                            <span className="text-[8px] bg-blue-50 text-blue-600 font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                              Abonado
                            </span>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => {
                            const totalItems = ticket.pagos?.[0]?.items || ticket.items || [];
                            const detalleHTML = totalItems.map(i => `
                              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; font-weight: bold; color: #334155;">
                                <span>• ${i.cantidad}x ${i.nombre}</span>
                                <span style="margin-left: auto; color: #059669;">$${(i.precioUnitario * i.cantidad).toFixed(2)}</span>
                              </div>
                            `).join('');
                            
                            Swal.fire({
                              title: `<span style="font-size: 15px; font-weight: 900; color: #0f172a;">DETALLE DE ${ticket.cliente}</span>`,
                              html: `<div style="text-align: left; padding: 10px 5px;">${detalleHTML}</div>`,
                              confirmButtonText: 'CERRAR',
                              confirmButtonColor: '#f4244c',
                              customClass: { popup: 'rounded-3xl' }
                            });
                          }}
                          className="p-1.5 bg-white text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200 transition-colors"
                        >
                          👁️
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Resumen Mensual */}
      {modalMesAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest">Resumen - {fechaFiltro.split('-')[1]}/{fechaFiltro.split('-')[0]}</h3>
              <button onClick={() => setModalMesAbierto(false)} className="text-xs bg-white/10 px-2.5 py-1 rounded-lg hover:bg-white/20 uppercase font-black">Cerrar</button>
            </div>
            
            <div className="overflow-y-auto p-4 flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase">
                    <th className="py-2">FECHA</th>
                    <th className="py-2 text-right">INGRESOS</th>
                    <th className="py-2 text-right">EGRESOS</th>
                    <th className="py-2 text-right">RESULTADO</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-50">
                  {resumenMes.map(r => (
                    <tr 
                      key={r.fecha} 
                      onClick={() => { setFechaFiltro(r.fecha); setModalMesAbierto(false); }}
                      className="hover:bg-rose-50/50 cursor-pointer transition-all"
                    >
                      <td className="py-2.5 text-blue-600 underline font-black">{r.fecha.split('-')[2]}/{r.fecha.split('-')[1]}</td>
                      <td className="py-2.5 text-right text-green-600">${r.ingresos.toFixed(2)}</td>
                      <td className="py-2.5 text-right text-rose-500">${r.egresos.toFixed(2)}</td>
                      <td className={`py-2.5 text-right font-black ${r.resultado >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${r.resultado.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[9px] font-black text-slate-400 block uppercase">TOTAL INGRESO</span>
                <span className="font-black text-green-600 text-sm">${totalIngresosMes.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 block uppercase">TOTAL EGRESO</span>
                <span className="font-black text-rose-600 text-sm">${totalEgresosMes.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 block uppercase">NETO TOTAL</span>
                <span className={`font-black text-sm ${(totalIngresosMes - totalEgresosMes) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ${(totalIngresosMes - totalEgresosMes).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// SUB-SECCIÓN C: AUDITORÍA Y LISTA DE GASTOS TOTALES
// ────────────────────────────────────────────────────────
function SubSeccionListaGastos({ gastos }) {
  const [desdeFecha, setDesdeFecha] = useState('');
  const [hastaFecha, setHastaFecha] = useState('');
  const [busquedaConcepto, setBusquedaConcepto] = useState('');

  const gastosFiltrados = gastos.filter(g => {
    const cumpleDesde = desdeFecha ? g.fecha >= desdeFecha : true;
    const cumpleHasta = hastaFecha ? g.fecha <= hastaFecha : true;
    const cumpleConcepto = busquedaConcepto ? g.concepto.toLowerCase().includes(busquedaConcepto.toLowerCase()) : true;
    return cumpleDesde && cumpleHasta && cumpleConcepto;
  }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const totalGastosPeriodo = gastosFiltrados.reduce((acc, curr) => acc + curr.monto, 0);

  const abrirEditarGasto = (gasto) => {
    Swal.fire({
      title: 'Modificar Registro de Gasto',
      html: `
        <input id="edit-gasto-concept" class="swal2-input" value="${gasto.concepto}" placeholder="Concepto">
        <input id="edit-gasto-amount" type="number" step="any" class="swal2-input" value="${gasto.monto}" placeholder="Monto $">
      `,
      preConfirm: () => {
        const concepto = document.getElementById('edit-gasto-concept').value;
        const monto = document.getElementById('edit-gasto-amount').value;
        if (!concepto || !monto) return Swal.showValidationMessage('Campos obligatorios vacíos');
        return { concepto: concepto.toUpperCase(), monto: parseFloat(monto) };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await updateDoc(doc(db, 'gastos', gasto.id), {
          concepto: result.value.concepto,
          monto: result.value.monto
        });
        Swal.fire('Modificado', 'El gasto fue reajustado en la base de datos', 'success');
      }
    });
  };

  const confirmarEliminarGasto = (id) => {
    Swal.fire({
      title: '¿Eliminar registro de gasto?',
      text: "Se descontará y actualizará el dashboard al instante.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f4244c',
      confirmButtonText: 'Eliminar permanentemente'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteDoc(doc(db, 'gastos', id));
        Swal.fire('Removido', 'Gasto eliminado del historial', 'success');
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 space-y-6">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Auditoría General de Egresos</h3>
      
      <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Desde:</label>
          <input type="date" value={desdeFecha} onChange={e => setDesdeFecha(e.target.value)} className="w-full p-2 border rounded-xl text-xs font-bold outline-none bg-white"/>
        </div>
        <div>
          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Hasta:</label>
          <input type="date" value={hastaFecha} onChange={e => setHastaFecha(e.target.value)} className="w-full p-2 border rounded-xl text-xs font-bold outline-none bg-white"/>
        </div>
        <div>
          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Buscar por Concepto:</label>
          <input type="text" placeholder="EJ. GAS, LUZ, EMBUTIDOS" value={busquedaConcepto} onChange={e => setBusquedaConcepto(e.target.value)} className="w-full p-2 border rounded-xl text-xs font-bold outline-none bg-white uppercase placeholder:text-slate-300"/>
        </div>
      </div>

      <div className="flex justify-between items-center px-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Registros Encontrados: {gastosFiltrados.length}</span>
        <span className="text-xs font-black text-slate-700">TOTAL PERÍODO: <span className="text-rose-600">${totalGastosPeriodo.toFixed(2)}</span></span>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-2">Fecha</th>
              <th className="py-3 px-2">Concepto</th>
              <th className="py-3 px-2 text-right">Monto</th>
              <th className="py-3 px-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-50">
            {gastosFiltrados.map(g => (
              <tr key={g.id} className="hover:bg-slate-50/80 transition-all">
                <td className="py-3 px-2 text-[11px] font-black text-slate-400">{g.fecha.split('-')[2]}/{g.fecha.split('-')[1]}</td>
                <td className="py-3 px-2 uppercase tracking-tight max-w-[180px] truncate">{g.concepto}</td>
                <td className="py-3 px-2 text-right text-rose-600 font-black">-${g.monto.toFixed(2)}</td>
                <td className="py-3 px-2">
                  <div className="flex justify-center gap-1.5">
                    <button onClick={() => abrirEditarGasto(g)} className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><Edit size={13}/></button>
                    <button onClick={() => confirmarEliminarGasto(g.id)} className="p-1.5 bg-rose-50 text-rose-400 hover:text-rose-600 rounded-lg transition-colors"><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {gastosFiltrados.length === 0 && (
          <div className="text-center py-8 text-slate-300 text-xs font-bold uppercase tracking-widest italic">No se hallaron egresos</div>
        )}
      </div>
    </div>
  );
}