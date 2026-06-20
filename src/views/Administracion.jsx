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
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'Contraseña incorrecta',
        icon: 'error',
        confirmButtonColor: '#4A4A4A',
        didOpen: () => {
          Swal.getPopup().style.backgroundColor = '#FFF8F0';
          Swal.getPopup().style.borderRadius = '2rem';
        }
      });
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
      <div className="flex items-center justify-center min-h-[85vh] p-4" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl border border-orange-100/50 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#FF4081]" style={{ backgroundColor: 'rgba(255, 64, 129, 0.1)' }}>
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight italic mb-2" style={{ color: '#4A4A4A', fontFamily: '"Nunito", sans-serif' }}>ÁREA RESTRINGIDA</h2>
          <p className="text-xs font-bold uppercase tracking-wider mb-6" style={{ color: '#4A4A4A', opacity: 0.6 }}>Ingresa el PIN de Administrador</p>
          <form onSubmit={manejarAcceso} className="space-y-4">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full tracking-widest text-center py-3.5 border-2 rounded-2xl font-black outline-none transition-all text-lg"
              style={{ backgroundColor: '#FFF8F0', borderColor: '#FFEBD9', color: '#4A4A4A' }}
              required
            />
            <button type="submit" className="w-full text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-sm active:scale-[0.98]" style={{ backgroundColor: '#FF4081' }}>
              Validar Identidad
            </button>
          </form>

          <button 
            onClick={() => alCambiarVista("tomar")} 
            className="w-full mt-4 font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest text-center transition-all border border-transparent hover:border-[#FFEBD9]"
            style={{ backgroundColor: '#FFEBD9', color: '#4A4A4A' }}
          >
            &larr; Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 pb-28 relative min-h-[90vh]" style={{ backgroundColor: '#FFF8F0' }}>
      
      {/* =========================================================
          RENDERIZADO CONDICIONAL DE LAS PESTAÑAS INTERNAS
          ========================================================= */}
      {pestanaActiva === 'dashboard' && <SubSeccionDashboard ventas={ventasTotales} gastos={gastosTotales} metas={metasDelDia} />}
      
      {pestanaActiva === 'menu' && <GestionMenu productos={productosMenu} />}
      
      {pestanaActiva === 'listaGastos' && <SubSeccionListaGastos gastos={gastosTotales} />}

      {/* =========================================================
          BARRA DE NAVEGACIÓN ESTÁTICA INFERIOR (BOTTOM NAV BAR)
          ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 backdrop-blur-md border-t shadow-[0_-8px_30px_rgba(255,180,150,0.15)]" style={{ backgroundColor: 'rgba(255, 248, 240, 0.95)', borderColor: '#FFEBD9' }}>
        <div className="flex max-w-md mx-auto p-1.5 rounded-2xl justify-between gap-1" style={{ backgroundColor: '#FFEBD9' }}>
          <button 
            onClick={() => setPestanaActiva('dashboard')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${pestanaActiva === 'dashboard' ? 'text-white shadow-sm' : 'hover:bg-white/40'}`}
            style={{ 
              backgroundColor: pestanaActiva === 'dashboard' ? '#FF4081' : 'transparent',
              color: pestanaActiva === 'dashboard' ? '#white' : '#4A4A4A'
            }}
          >
            <BarChart3 size={15} />
            <span className="text-[9px] sm:text-[10px]">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setPestanaActiva('menu')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${pestanaActiva === 'menu' ? 'text-white shadow-sm' : 'hover:bg-white/40'}`}
            style={{ 
              backgroundColor: pestanaActiva === 'menu' ? '#FF4081' : 'transparent',
              color: pestanaActiva === 'menu' ? '#white' : '#4A4A4A'
            }}
          >
            <Edit3 size={15} />
            <span className="text-[9px] sm:text-[10px]">Menú</span>
          </button>
          
          <button 
            onClick={() => setPestanaActiva('listaGastos')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${pestanaActiva === 'listaGastos' ? 'text-white shadow-sm' : 'hover:bg-white/40'}`}
            style={{ 
              backgroundColor: pestanaActiva === 'listaGastos' ? '#FF4081' : 'transparent',
              color: pestanaActiva === 'listaGastos' ? '#white' : '#4A4A4A'
            }}
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
        registros[fechaTexto].ingress = (registros[fechaTexto].ingresos || 0);
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
    <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-xl border overflow-hidden" style={{ borderColor: '#FFEBD9' }}>
      <div className="text-white p-5 flex justify-between items-center" style={{ backgroundColor: '#4A4A4A' }}>
        <button onClick={() => cambiarDia(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ArrowLeft size={16}/></button>
        <span className="font-black text-xs uppercase tracking-wide text-center" style={{ fontFamily: '"Nunito", sans-serif' }}>{obtenerFechaFormateada(fechaFiltro)}</span>
        <button onClick={() => cambiarDia(1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ArrowRight size={16}/></button>
      </div>

      <div className="p-6 space-y-5" style={{ color: '#4A4A4A' }}>
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#FFF8F0' }}>
          <span className="text-[11px] font-black uppercase tracking-wider opacity-70">🎯 Meta del día:</span>
          <div className="relative max-w-[120px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-sm opacity-50">$</span>
            <input 
              type="number" 
              value={metaInput}
              onChange={(e) => guardarMeta(e.target.value)}
              placeholder="0.00"
              className="w-full pl-6 pr-3 py-1.5 border rounded-xl font-black text-sm outline-none text-right"
              style={{ backgroundColor: '#FFF8F0', borderColor: '#FFEBD9' }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold">
            <span>💰 INGRESOS (VENTAS):</span>
            <span className="font-black" style={{ color: '#34C759' }}>${ingresos.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>💸 EGRESOS (GASTOS):</span>
            <span className="font-black" style={{ color: '#E6144A' }}>-${egresos.toFixed(2)}</span>
          </div>
          <hr style={{ borderTop: '2px dashed #FFEBD9' }} className="my-2" />
          <div className="flex justify-between items-center p-3 rounded-2xl" style={{ backgroundColor: '#FFEBD9' }}>
            <span className="text-xs font-black uppercase">✅ RESULTADO DEL DÍA:</span>
            <span className="font-black text-lg" style={{ color: resultadoDia >= 0 ? '#34C759' : '#E6144A', fontFamily: '"Fredoka One", sans-serif' }}>
              ${resultadoDia.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs font-bold px-3 opacity-80">
            <span>📊 VS META:</span>
            <span className="font-black" style={{ color: vsMeta >= 0 ? '#34C759' : '#FF4081' }}>
              {vsMeta >= 0 ? '+' : ''}${vsMeta.toFixed(2)}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setModalMesAbierto(true)}
          className="w-full font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest text-center transition-all shadow-sm active:scale-[0.99]"
          style={{ backgroundColor: '#FF4081', color: 'white' }}
        >
          📊 Ver Resumen del Mes
        </button>

        <div className="mt-4 pt-4 border-t" style={{ borderColor: '#FFF8F0' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-black uppercase tracking-wider opacity-70">
              🎟️ Tickets Cerrados ({ventasDia.filter(v => v.pagado === true).length})
            </h3>
          </div>

          {ventasDia.filter(v => v.pagado === true).length === 0 ? (
            <div className="text-center py-6 text-[11px] font-bold uppercase tracking-wider rounded-2xl border-2 border-dashed" style={{ backgroundColor: '#FFF8F0', borderColor: '#FFEBD9', color: '#4A4A4A', opacity: 0.6 }}>
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
                      className="flex items-center justify-between p-3 border rounded-2xl shadow-sm transition-all bg-white"
                      style={{ borderColor: '#FFEBD9' }}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-tight" style={{ color: '#4A4A4A' }}>
                          {ticket.cliente}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-tight opacity-60">
                          🕒 {ticket.horaFinalizacion || ticket.hora || "Cerrado"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-xs font-black block" style={{ color: '#34C759' }}>
                            ${parseFloat(montoFinal).toFixed(2)}
                          </span>
                          {ticket.conteoCobros > 0 && (
                            <span className="text-[8px] text-white font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-sm" style={{ backgroundColor: '#FF4081' }}>
                              Abonado
                            </span>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => {
                            const totalItems = ticket.pagos?.[0]?.items || ticket.items || [];
                            const detalleHTML = totalItems.map(i => `
                              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; font-weight: bold; color: #4A4A4A;">
                                <span>• ${i.cantidad}x ${i.nombre}</span>
                                <span style="margin-left: auto; color: #34C759;">$${(i.precioUnitario * i.cantidad).toFixed(2)}</span>
                              </div>
                            `).join('');
                            
                            Swal.fire({
                              title: `<span style="font-size: 15px; font-weight: 900; color: #4A4A4A; font-family: 'Nunito', sans-serif;">DETALLE DE ${ticket.cliente}</span>`,
                              html: `<div style="text-align: left; padding: 10px 5px;">${detalleHTML}</div>`,
                              confirmButtonText: 'CERRAR',
                              confirmButtonColor: '#4A4A4A',
                              customClass: { popup: 'rounded-[2rem]' },
                              didOpen: () => {
                                Swal.getPopup().style.backgroundColor = '#FFF8F0';
                              }
                            });
                          }}
                          className="p-1.5 bg-white rounded-xl border transition-colors hover:bg-orange-50"
                          style={{ borderColor: '#FFEBD9', color: '#4A4A4A' }}
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="rounded-[2.5rem] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border" style={{ backgroundColor: '#FFF8F0', borderColor: '#FFEBD9' }}>
            <div className="text-white p-5 flex justify-between items-center" style={{ backgroundColor: '#4A4A4A' }}>
              <h3 className="font-black text-xs uppercase tracking-widest">Resumen - {fechaFiltro.split('-')[1]}/{fechaFiltro.split('-')[0]}</h3>
              <button onClick={() => setModalMesAbierto(false)} className="text-[10px] bg-white/20 px-3 py-1.5 rounded-xl hover:bg-white/30 uppercase font-black transition-colors">Cerrar</button>
            </div>
            
            <div className="overflow-y-auto p-5 flex-1 bg-white m-3 rounded-[2rem] border" style={{ borderColor: '#FFEBD9' }}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-[10px] font-black uppercase" style={{ color: '#4A4A4A', opacity: 0.5, borderColor: '#FFF8F0' }}>
                    <th className="py-2">FECHA</th>
                    <th className="py-2 text-right">INGRESOS</th>
                    <th className="py-2 text-right">EGRESOS</th>
                    <th className="py-2 text-right">RESULTADO</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold divide-y" style={{ color: '#4A4A4A', divideColor: '#FFF8F0' }}>
                  {resumenMes.map(r => (
                    <tr 
                      key={r.fecha} 
                      onClick={() => { setFechaFiltro(r.fecha); setModalMesAbierto(false); }}
                      className="hover:bg-orange-50/60 cursor-pointer transition-all"
                    >
                      <td className="py-2.5 font-black" style={{ color: '#FF4081', textDecoration: 'underline' }}>{r.fecha.split('-')[2]}/{r.fecha.split('-')[1]}</td>
                      <td className="py-2.5 text-right" style={{ color: '#34C759' }}>${r.ingresos.toFixed(2)}</td>
                      <td className="py-2.5 text-right" style={{ color: '#E6144A' }}>${r.egresos.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-black" style={{ color: r.resultado >= 0 ? '#34C759' : '#E6144A' }}>${r.resultado.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t grid grid-cols-3 gap-2 text-center" style={{ backgroundColor: '#FFEBD9', borderColor: '#FFEBD9' }}>
              <div>
                <span className="text-[9px] font-black block uppercase opacity-60" style={{ color: '#4A4A4A' }}>TOTAL INGRESO</span>
                <span className="font-black text-sm" style={{ color: '#34C759' }}>${totalIngresosMes.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[9px] font-black block uppercase opacity-60" style={{ color: '#4A4A4A' }}>TOTAL EGRESO</span>
                <span className="font-black text-sm" style={{ color: '#E6144A' }}>${totalEgresosMes.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[9px] font-black block uppercase opacity-60" style={{ color: '#4A4A4A' }}>NETO TOTAL</span>
                <span className="font-black text-sm" style={{ color: (totalIngresosMes - totalEgresosMes) >= 0 ? '#34C759' : '#E6144A', fontFamily: '"Fredoka One", sans-serif' }}>
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
        <input id="edit-gasto-concept" class="swal2-input" value="${gasto.concepto}" placeholder="Concepto" style="font-family: sans-serif;">
        <input id="edit-gasto-amount" type="number" step="any" class="swal2-input" value="${gasto.monto}" placeholder="Monto $">
      `,
      confirmButtonColor: '#FF4081',
      cancelButtonColor: '#4A4A4A',
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'rounded-[2rem]' },
      didOpen: () => {
        Swal.getPopup().style.backgroundColor = '#FFF8F0';
      },
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
        Swal.fire({
          title: 'Modificado',
          text: 'El gasto fue reajustado en la base de datos',
          icon: 'success',
          confirmButtonColor: '#4A4A4A',
          customClass: { popup: 'rounded-[2rem]' },
          didOpen: () => { Swal.getPopup().style.backgroundColor = '#FFF8F0'; }
        });
      }
    });
  };

  const confirmarEliminarGasto = (id) => {
    Swal.fire({
      title: '¿Eliminar registro de gasto?',
      text: "Se descontará y actualizará el dashboard al instante.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E6144A',
      cancelButtonColor: '#4A4A4A',
      confirmButtonText: 'Eliminar permanentemente',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'rounded-[2rem]' },
      didOpen: () => {
        Swal.getPopup().style.backgroundColor = '#FFF8F0';
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteDoc(doc(db, 'gastos', id));
        Swal.fire({
          title: 'Removido',
          text: 'Gasto eliminado del historial',
          icon: 'success',
          confirmButtonColor: '#4A4A4A',
          customClass: { popup: 'rounded-[2rem]' },
          didOpen: () => { Swal.getPopup().style.backgroundColor = '#FFF8F0'; }
        });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] p-6 shadow-xl border space-y-6" style={{ borderColor: '#FFEBD9', color: '#4A4A4A' }}>
      <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Auditoría General de Egresos</h3>
      
      <div className="p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ backgroundColor: '#FFF8F0' }}>
        <div>
          <label className="text-[9px] font-black uppercase block mb-1 opacity-70">Desde:</label>
          <input type="date" value={desdeFecha} onChange={e => setDesdeFecha(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs font-bold outline-none bg-white" style={{ borderColor: '#FFEBD9' }}/>
        </div>
        <div>
          <label className="text-[9px] font-black uppercase block mb-1 opacity-70">Hasta:</label>
          <input type="date" value={hastaFecha} onChange={e => setHastaFecha(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs font-bold outline-none bg-white" style={{ borderColor: '#FFEBD9' }}/>
        </div>
        <div>
          <label className="text-[9px] font-black uppercase block mb-1 opacity-70">Buscar por Concepto:</label>
          <input type="text" placeholder="EJ. GAS, LUZ, EMBUTIDOS" value={busquedaConcepto} onChange={e => setBusquedaConcepto(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs font-bold outline-none bg-white uppercase placeholder:text-orange-200" style={{ borderColor: '#FFEBD9' }}/>
        </div>
      </div>

      <div className="flex justify-between items-center px-2">
        <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Registros Encontrados: {gastosFiltrados.length}</span>
        <span className="text-xs font-black">TOTAL PERÍODO: <span style={{ color: '#E6144A' }}>${totalGastosPeriodo.toFixed(2)}</span></span>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-[9px] font-black uppercase tracking-wider opacity-60" style={{ borderColor: '#FFF8F0' }}>
              <th className="py-3 px-2">Fecha</th>
              <th className="py-3 px-2">Concepto</th>
              <th className="py-3 px-2 text-right">Monto</th>
              <th className="py-3 px-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold divide-y" style={{ divideColor: '#FFF8F0' }}>
            {gastosFiltrados.map(g => (
              <tr key={g.id} className="hover:bg-orange-50/40 transition-all">
                <td className="py-3 px-2 text-[11px] font-black opacity-50">{g.fecha.split('-')[2]}/{g.fecha.split('-')[1]}</td>
                <td className="py-3 px-2 uppercase tracking-tight max-w-[180px] truncate">{g.concepto}</td>
                <td className="py-3 px-2 text-right font-black" style={{ color: '#E6144A' }}>-${g.monto.toFixed(2)}</td>
                <td className="py-3 px-2">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => abrirEditarGasto(g)} className="p-2 bg-orange-50/50 hover:bg-white rounded-xl border transition-all" style={{ borderColor: '#FFEBD9', color: '#4A4A4A' }}><Edit size={13}/></button>
                    <button onClick={() => confirmarEliminarGasto(g.id)} className="p-2 bg-rose-50 hover:bg-white rounded-xl border transition-all" style={{ borderColor: '#FFEBD9', color: '#FF4081' }}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {gastosFiltrados.length === 0 && (
          <div className="text-center py-8 text-xs font-bold uppercase tracking-widest italic opacity-40">No se hallaron egresos</div>
        )}
      </div>
    </div>
  );
}