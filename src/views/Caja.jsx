import React from 'react';
import { Wallet, PlusCircle, Split, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Historial({ ventas, alCobrar, alAgregarExtra, alCambiarVista, alCobrarParcial }) {
  
  // FUNCIÓN AUXILIAR: Obtiene la fecha de hoy formateada de forma local (AAAA-MM-DD)
  const obtenerFechaLocalHoy = () => {
    const hoyRaw = new Date();
    const offset = hoyRaw.getTimezoneOffset() * 60000;
    return new Date(hoyRaw.getTime() - offset).toISOString().split('T')[0];
  };

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
      confirmButtonColor: '#f4244c',
      denyButtonColor: '#059669',
      borderRadius: '2rem'
    }).then((result) => {
      if (result.isConfirmed) {
        alCambiarVista("tomar");
      } else if (result.isDenied) {
        abrirModalExtraLibre(venta); // Corregido: antes decía openModalExtraLibre
      }
    });
  };

  // FUNCIÓN REUTILIZABLE: Despliega la calculadora de efectivo para cobros totales o parciales
  const procesarPagoEfectivo = (titulo, totalAPagar, callbackConfirmado) => {
    Swal.fire({
      title: titulo,
      html: `
        <div style="font-family: sans-serif; text-align: left;">
          <div style="background-color: #ffebee; border: 2px solid #ffbccc; padding: 16px; border-radius: 1.25rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <span style="font-weight: 900; font-size: 14px; color: #0f172a;">TOTAL A COBRAR:</span>
            <span style="font-size: 24px; font-weight: 900; color: #f4244c;">$${totalAPagar.toFixed(2)}</span>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 6px;">
              Efectivo Recibido
            </label>
            <div style="position: relative;">
              <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-weight: bold; color: #94a3b8; font-size: 18px;">$</span>
              <input 
                type="number" 
                id="efectivo-recibido" 
                step="any" 
                placeholder="0.00" 
                style="width: 100%; box-sizing: border-box; padding: 14px 14px 14px 35px; border: 2px solid #cbd5e1; border-radius: 1rem; font-size: 18px; font-weight: 800; color: #0f172a; outline: none;"
              />
            </div>
          </div>

          <div id="contenedor-cambio" style="display: none; background-color: #f0fdf4; border: 2px solid #bbf7d0; padding: 14px; border-radius: 1rem; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 10px; font-weight: 900; color: #16a34a; display: block; text-transform: uppercase;">Cambio a devolver</span>
              <span id="texto-cambio" style="font-size: 20px; font-weight: 900; color: #15803d;">$0.00</span>
            </div>
            <span style="font-size: 24px;">🎉</span>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✓ CONFIRMAR COBRO',
      confirmButtonColor: '#16a34a',
      cancelButtonText: 'CANCELAR',
      customClass: {
        popup: 'rounded-[2rem]'
      },
      didOpen: () => {
        const inputEfectivo = document.getElementById('efectivo-recibido');
        const contenedorCambio = document.getElementById('contenedor-cambio');
        const textoCambio = document.getElementById('texto-cambio');
        const confirmButton = Swal.getConfirmButton();

        inputEfectivo.addEventListener('input', (e) => {
          const valor = parseFloat(e.target.value) || 0;
          
          if (valor >= totalAPagar) {
            const cambio = valor - totalAPagar;
            textoCambio.innerText = `$${cambio.toFixed(2)}`;
            contenedorCambio.style.display = 'flex';
            confirmButton.removeAttribute('disabled');
          } else {
            contenedorCambio.style.display = 'none';
            if (e.target.value !== "") {
              confirmButton.setAttribute('disabled', 'true');
            } else {
              confirmButton.removeAttribute('disabled');
            }
          }
        });
      },
      preConfirm: () => {
        const inputEfectivo = document.getElementById('efectivo-recibido').value;
        const valor = parseFloat(inputEfectivo) || 0;

        if (inputEfectivo !== "" && valor < totalAPagar) {
          return Swal.showValidationMessage('El efectivo recibido es menor al total de la cuenta');
        }
        return true;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        callbackConfirmado();
      }
    });
  };

  const manejarCuentasAparte = (venta) => {
    const itemsOriginales = venta.pagos?.[0]?.items || venta.items || venta.productos || [];

    if (itemsOriginales.length === 0) {
      return Swal.fire('Error', 'No se encontraron productos pendientes en la orden.', 'error');
    }

    const itemsDesglosados = [];
    itemsOriginales.forEach((item) => {
      const cantidadCiclo = item.cantidad || 1;
      for (let i = 0; i < cantidadCiclo; i++) {
        itemsDesglosados.push({
          ...item,
          cantidad: 1,
          idTemp: Math.random().toString(36).substr(2, 9)
        });
      }
    });

    Swal.fire({
      title: 'Dividir Cuenta',
      html: `
        <div id="lista-split" style="text-align: left; max-height: 350px; overflow-y: auto; padding: 5px;">
          ${itemsDesglosados.map((item, index) => `
            <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid #f1f5f9; border-radius: 1rem; background: white;">
              <input type="checkbox" id="split-item-${index}" class="split-checkbox" value="${index}" style="width: 22px; height: 22px; cursor: pointer;">
              <label for="split-item-${index}" style="cursor: pointer; flex: 1;">
                <div style="font-weight: 800; font-size: 13px; text-transform: uppercase; color: #1e293b;">1x ${item.nombre}</div>
                ${item.aderezos && item.aderezos.length > 0 ? `<div style="font-size: 10px; color: #d97706; font-weight: 700;">${item.aderezos.join(', ')}</div>` : ''}
                <div style="color: #f4244c; font-weight: 900; font-size: 14px;">$${item.precioUnitario.toFixed(2)}</div>
              </label>
            </div>
          `).join('')}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SIGUIENTE: EFECTIVO',
      confirmButtonColor: '#f4244c',
      cancelButtonText: 'CANCELAR',
      preConfirm: () => {
        const seleccionados = [];
        itemsDesglosados.forEach((item, index) => {
          if (document.getElementById(`split-item-${index}`).checked) {
            seleccionados.push(item);
          }
        });
        if (seleccionados.length === 0) return Swal.showValidationMessage('Selecciona qué vas a cobrar');
        return seleccionados;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const seleccionados = result.value;
        const montoTotalCobrar = seleccionados.reduce((acc, i) => acc + i.precioUnitario, 0);
        
        // CORRECCIÓN: Forzamos la fecha local exacta del cobro parcial
        const fechaCanceladoString = obtenerFechaLocalHoy();

        procesarPagoEfectivo(
          `PAGO PARCIAL - ${venta.cliente}`,
          montoTotalCobrar,
          () => alCobrarParcial(venta.idFB, seleccionados, montoTotalCobrar, fechaCanceladoString)
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Cuentas por Cobrar</h2>
        <span className="bg-[#f4244c] text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest">
          {ventas.length} ACTIVAS
        </span>
      </div>

      {ventas.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold italic uppercase text-xs">No hay clientes por pagar</p>
        </div>
      )}

      {ventas.map((venta) => {
        const detallePendiente = venta.pagos?.[0]?.items || venta.items || venta.productos || [];
        const totalItemsFisicos = detallePendiente.reduce((acc, curr) => acc + (curr.cantidad || 1), 0);
        
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
                <p className="font-black text-2xl text-[#f4244c] leading-none">${venta.totalAcumulado?.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalle pendiente:</p>
              {detallePendiente.map((item, idx) => (
                <div key={idx} className="flex flex-col border-b border-slate-50 pb-2 last:border-0">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-700 font-bold uppercase text-sm">
                      <span className="text-[#f4244c] mr-2">{(item.cantidad || 1)}x</span> 
                      {item.nombre}
                    </span>
                    <span className="font-black text-slate-900 text-sm">${((item.precioUnitario || 0) * (item.cantidad || 1)).toFixed(2)}</span>
                  </div>

                  <div className="ml-6 flex flex-col gap-1 mt-1">
                    {item.aderezos && item.aderezos.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-amber-600 uppercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 w-fit">
                          Aderezos: {item.aderezos.join(', ')}
                        </span>
                      </div>
                    )}

                    {item.nota && (
                      <div className="flex items-center gap-1 text-slate-500 italic text-[10px]">
                        <MessageSquare size={10} />
                        <span>{item.nota}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 grid grid-cols-2 gap-3">
              <button 
                onClick={() => manejarAgregarExtraEnCaja(venta)}
                className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 p-3 rounded-xl font-black text-[10px] text-slate-600 transition-all hover:bg-slate-50"
              >
                <PlusCircle size={16} /> EXTRA
              </button>

              {totalItemsFisicos > 1 ? (
                <button 
                  onClick={() => manejarCuentasAparte(venta)}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-[#ffbccc]/60 p-3 rounded-xl font-black text-[10px] text-[#f4244c] border-rose-100 shadow-sm active:bg-rose-50 transition-all"
                >
                  <Split size={16} /> APARTE
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 bg-slate-100 p-3 rounded-xl font-black text-[9px] text-slate-400 uppercase italic">
                  Último Item
                </div>
              )}

              <button 
                onClick={() => {
                  // CORRECCIÓN: Forzamos la fecha local exacta del cobro total completo de la cuenta
                  const fechaCanceladoString = obtenerFechaLocalHoy();

                  procesarPagoEfectivo(
                    `COBRAR CUENTA - ${venta.cliente}`, 
                    venta.totalAcumulado || 0, 
                    () => alCobrar(venta.idFB, fechaCanceladoString)
                  );
                }}
                className="col-span-2 bg-[#f4244c] hover:bg-[#d61b3f] text-white p-4 rounded-xl font-black text-sm shadow-lg shadow-[#f4244c]/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
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