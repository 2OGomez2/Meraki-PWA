import React from 'react';
import { Wallet, PlusCircle, Split } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Historial({ ventas, alCobrar, alAgregarExtra, alCambiarVista, alCobrarParcial }) {
  
  const abrirModalExtraLibre = (venta) => {
    Swal.fire({
      title: 'Nuevo Extra para ' + venta.cliente,
      html: `
        <input id="extra-desc" class="swal2-input" placeholder="Nombre (ej. Extra Queso)">
        <input id="extra-precio" type="number" step="0.01" class="swal2-input" placeholder="Precio $">
      `,
      preConfirm: () => {
        const nombre = document.getElementById('extra-desc').value;
        const precio = document.getElementById('extra-precio').value;
        if (!nombre || !precio) return Swal.showValidationMessage('Faltan datos');
        return { nombre: nombre.toUpperCase(), precio: parseFloat(precio) };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevoExtra = {
          nombre: result.value.nombre,
          precioUnitario: result.value.precio,
          cantidad: 1,
          esExtra: true
        };
        // CORRECCIÓN AQUÍ: Quitamos el tercer argumento (venta.totalAcumulado) 
        // para que coincida con la función en App.jsx
        alAgregarExtra(venta.idFB, nuevoExtra);
      }
    });
  };

  const manejarAgregarExtraEnCaja = (venta) => {
    Swal.fire({
      title: '¿Qué desea agregar?',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'MENÚ',
      denyButtonText: 'EXTRAS LIBRES',
      cancelButtonText: 'CANCELAR',
      confirmButtonColor: '#2563eb',
      denyButtonColor: '#059669',
      borderRadius: '2rem'
    }).then((result) => {
      if (result.isConfirmed) {
        alCambiarVista("tomar");
      } else if (result.isDenied) {
        abrirModalExtraLibre(venta);
      }
    });
  };

  const manejarCuentasAparte = (venta) => {
    const items = venta.pagos?.[0]?.items || [];
    
    Swal.fire({
      title: 'Dividir Cuenta',
      html: `
        <div id="lista-split" style="text-align: left; max-height: 300px; overflow-y: auto;">
          ${items.map((item, index) => `
            <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px; padding: 10px; border-bottom: 1px solid #eee;">
              <input type="checkbox" id="item-${index}" value="${index}" style="width: 20px; height: 20px; cursor: pointer;">
              <label for="item-${index}" style="cursor: pointer; flex: 1;">
                <div style="font-weight: 800; font-size: 14px; text-transform: uppercase;">${item.cantidad}x ${item.nombre}</div>
                <div style="color: #2563eb; font-weight: 900;">$${(item.precioUnitario * item.cantidad).toFixed(2)}</div>
              </label>
            </div>
          `).join('')}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'COBRAR SELECCIÓN',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const seleccionados = [];
        items.forEach((item, index) => {
          if (document.getElementById(`item-${index}`).checked) {
            seleccionados.push(item);
          }
        });
        if (seleccionados.length === 0) return Swal.showValidationMessage('Selecciona qué vas a cobrar');
        return seleccionados;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const montoTotalCobrar = result.value.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);
        alCobrarParcial(venta.idFB, result.value, montoTotalCobrar);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Cuentas por Cobrar</h2>
        <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest">
          {ventas.length} ACTIVAS
        </span>
      </div>

      {ventas.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold italic uppercase text-xs">No hay clientes por pagar</p>
        </div>
      )}

      {ventas.map((venta) => {
        const totalItems = venta.pagos?.[0]?.items?.length || 0;
        
        return (
          <div key={venta.idFB} className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden mb-6">
            {venta.conteoCobros > 0 && (
              <div className="bg-amber-100 text-amber-700 text-[10px] font-black py-2 text-center uppercase tracking-widest border-b border-amber-200">
                ⚠️ Abono #{venta.conteoCobros} realizado en esta cuenta
              </div>
            )}

            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                <h3 className="font-black text-lg uppercase leading-none">{venta.cliente}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resta por pagar</p>
                <p className="font-black text-2xl text-blue-400 leading-none">${venta.totalAcumulado?.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalle pendiente:</p>
              {venta.pagos?.[0]?.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b border-slate-50 pb-2">
                  <span className="text-slate-700 font-bold uppercase">
                    <span className="text-blue-600 mr-2">{item.cantidad}x</span> 
                    {item.nombre}
                  </span>
                  <span className="font-black text-slate-900">${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 grid grid-cols-2 gap-3">
              <button 
                onClick={() => manejarAgregarExtraEnCaja(venta)}
                className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 p-3 rounded-xl font-black text-[10px] text-slate-600"
              >
                <PlusCircle size={16} /> EXTRA
              </button>

              {totalItems > 1 ? (
                <button 
                  onClick={() => manejarCuentasAparte(venta)}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 p-3 rounded-xl font-black text-[10px] text-blue-600 border-blue-100"
                >
                  <Split size={16} /> APARTE
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 bg-slate-100 p-3 rounded-xl font-black text-[9px] text-slate-400 uppercase italic">
                  Último Item
                </div>
              )}

              <button 
                onClick={() => alCobrar(venta.idFB)}
                className="col-span-2 bg-blue-600 text-white p-4 rounded-xl font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Wallet size={18} /> COBRAR TODO EL TOTAL
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}