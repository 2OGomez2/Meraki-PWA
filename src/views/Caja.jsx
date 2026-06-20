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
        <input id="extra-desc" class="swal2-input" placeholder="Nombre (ej. Extra Queso)" style="border-radius: 12px; border-color: #FFEBD9;">
        <input id="extra-precio" type="number" step="0.01" class="swal2-input" placeholder="Precio $" style="border-radius: 12px; border-color: #FFEBD9;">
      `,
      confirmButtonColor: '#FF4081',
      cancelButtonColor: '#E6144A',
      customClass: { popup: '!rounded-[2rem] !p-6' },
      didOpen: () => {
        Swal.getPopup().style.backgroundColor = '#FFF8F0';
      },
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
      confirmButtonColor: '#FF4081',
      denyButtonColor: '#34C759',
      cancelButtonColor: '#E6144A',
      customClass: { popup: '!rounded-[2rem]' },
      didOpen: () => {
        Swal.getPopup().style.backgroundColor = '#FFF8F0';
      }
    }).then((result) => {
      if (result.isConfirmed) {
        alCambiarVista("tomar");
      } else if (result.isDenied) {
        abrirModalExtraLibre(venta);
      }
    });
  };

  // FUNCIÓN REUTILIZABLE: Despliega la calculadora de efectivo para cobros totales o parciales
  const procesarPagoEfectivo = (titulo, totalAPagar, callbackConfirmado) => {
    Swal.fire({
      title: titulo,
      html: `
        <div style="font-family: 'Nunito', sans-serif; text-align: left; color: #4A4A4A;">
          <div style="background-color: #FFEBD9; border: 2px solid #FFEBD9; padding: 16px; border-radius: 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(255, 180, 150, 0.2);">
            <span style="font-weight: 900; font-size: 14px; color: #4A4A4A;">TOTAL A COBRAR:</span>
            <span style="font-size: 24px; font-weight: 900; color: #E6144A;">$${totalAPagar.toFixed(2)}</span>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #4A4A4A; display: block; margin-bottom: 6px; opacity: 0.8;">
              Efectivo Recibido
            </label>
            <div style="position: relative;">
              <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-weight: bold; color: #E6144A; font-size: 18px;">$</span>
              <input 
                type="number" 
                id="efectivo-recibido" 
                step="any" 
                placeholder="0.00" 
                style="width: 100%; box-sizing: border-box; padding: 14px 14px 14px 35px; border: 2px solid #FFEBD9; border-radius: 50px; font-size: 18px; font-weight: 800; color: #4A4A4A; outline: none; background-color: #FFF8F0;"
              />
            </div>
          </div>

          <div id="contenedor-cambio" style="display: none; background-color: #FFF8F0; border: 2px solid #34C759; padding: 14px; border-radius: 1.5rem; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 10px; font-weight: 900; color: #34C759; display: block; text-transform: uppercase;">Cambio a devolver</span>
              <span id="texto-cambio" style="font-size: 20px; font-weight: 900; color: #34C759;">$0.00</span>
            </div>
            <span style="font-size: 24px;">🐶</span>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✓ CONFIRMAR COBRO',
      confirmButtonColor: '#34C759',
      cancelButtonText: 'CANCELAR',
      cancelButtonColor: '#E6144A',
      customClass: {
        popup: 'rounded-[2.5rem]'
      },
      didOpen: () => {
        Swal.getPopup().style.backgroundColor = '#FFF8F0';
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
        <div id="lista-split" style="text-align: left; max-height: 350px; overflow-y: auto; padding: 5px; font-family: 'Nunito', sans-serif;">
          ${itemsDesglosados.map((item, index) => `
            <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid #FFEBD9; border-radius: 1.5rem; background: #FFF8F0;">
              <input type="checkbox" id="split-item-${index}" class="split-checkbox" value="${index}" style="width: 22px; height: 22px; cursor: pointer; accent-color: #FF4081;">
              <label for="split-item-${index}" style="cursor: pointer; flex: 1;">
                <div style="font-weight: 800; font-size: 13px; text-transform: uppercase; color: #4A4A4A;">1x ${item.nombre}</div>
                ${item.aderezos && item.aderezos.length > 0 ? `<div style="font-size: 10px; color: #E6144A; font-weight: 700;">${item.aderezos.join(', ')}</div>` : ''}
                <div style="color: #FF4081; font-weight: 900; font-size: 14px; margin-top: 2px;">$${item.precioUnitario.toFixed(2)}</div>
              </label>
            </div>
          `).join('')}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SIGUIENTE: EFECTIVO',
      confirmButtonColor: '#FF4081',
      cancelButtonText: 'CANCELAR',
      cancelButtonColor: '#E6144A',
      customClass: { popup: '!rounded-[2.5rem]' },
      didOpen: () => {
        Swal.getPopup().style.backgroundColor = '#FFF8F0';
      },
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
    <div className="space-y-6 p-2 min-h-[88vh]" style={{ backgroundColor: '#FFF8F0' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black tracking-tighter uppercase italic" style={{ color: '#4A4A4A', fontFamily: '"Nunito", sans-serif' }}>
          Cuentas por Cobrar
        </h2>
        <span className="text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest shadow-sm" style={{ backgroundColor: '#E6144A' }}>
          {ventas.length} ACTIVAS
        </span>
      </div>

      {ventas.length === 0 && (
        <div className="text-center py-20 rounded-[2.5rem] border-2 border-dashed" style={{ backgroundColor: '#FFEBD9', borderColor: '#FF4081' }}>
          <p className="font-bold italic uppercase text-xs" style={{ color: '#4A4A4A' }}>No hay clientes por pagar</p>
        </div>
      )}

      {ventas.map((venta) => {
        const detallePendiente = venta.pagos?.[0]?.items || venta.items || venta.productos || [];
        const totalItemsFisicos = detallePendiente.reduce((acc, curr) => acc + (curr.cantidad || 1), 0);
        
        return (
          <div 
            key={venta.idFB} 
            className="border overflow-hidden mb-6 rounded-[2.5rem]" 
            style={{ 
              backgroundColor: '#FFEBD9', 
              borderColor: '#FFEBD9',
              boxShadow: '0 4px 12px rgba(255, 180, 150, 0.25)'
            }}
          >
            {venta.conteoCobros > 0 && (
              <div className="text-[10px] font-black py-2 text-center uppercase tracking-widest border-b" style={{ backgroundColor: '#FFF8F0', borderColor: '#FFEBD9', color: '#E6144A' }}>
                ⚠️ Abono #{venta.conteoCobros} realizado en esta cuenta
              </div>
            )}

            <div className="p-5 flex justify-between items-center bg-white/40 border-b" style={{ borderColor: '#FFF8F0' }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#4A4A4A', opacity: 0.7 }}>Cliente</p>
                <h3 className="font-black text-xl uppercase leading-none" style={{ color: '#4A4A4A', fontFamily: '"Nunito", sans-serif' }}>{venta.cliente}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#4A4A4A', opacity: 0.7 }}>Resta por pagar</p>
                <p className="font-black text-2xl leading-none" style={{ color: '#E6144A', fontFamily: '"Fredoka One", sans-serif' }}>${venta.totalAcumulado?.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-5 space-y-3 bg-white/20">
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#4A4A4A', opacity: 0.8 }}>Detalle pendiente:</p>
              {detallePendiente.map((item, idx) => (
                <div key={idx} className="flex flex-col border-b pb-2 last:border-0" style={{ borderColor: '#FFF8F0' }}>
                  <div className="flex justify-between items-start">
                    <span className="font-bold uppercase text-sm" style={{ color: '#4A4A4A' }}>
                      <span className="mr-2 font-black" style={{ color: '#FF4081' }}>{(item.cantidad || 1)}x</span> 
                      {item.nombre}
                    </span>
                    <span className="font-black text-sm" style={{ color: '#4A4A4A' }}>${((item.precioUnitario || 0) * (item.cantidad || 1)).toFixed(2)}</span>
                  </div>

                  <div className="ml-6 flex flex-col gap-1 mt-1">
                    {item.aderezos && item.aderezos.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border" style={{ backgroundColor: '#FFF8F0', borderColor: '#FFEBD9', color: '#E6144A' }}>
                          Aderezos: {item.aderezos.join(', ')}
                        </span>
                      </div>
                    )}

                    {item.nota && (
                      <div className="flex items-center gap-1 italic text-[10px] font-semibold" style={{ color: '#FF4081' }}>
                        <MessageSquare size={10} />
                        <span>{item.nota}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 grid grid-cols-2 gap-3 bg-white/40">
              <button 
                onClick={() => manejarAgregarExtraEnCaja(venta)}
                className="flex items-center justify-center gap-2 border-2 p-3 bg-white transition-all font-black text-[10px]"
                style={{ borderRadius: '50px', borderColor: '#E6144A', color: '#E6144A', fontFamily: '"Nunito", sans-serif' }}
              >
                <PlusCircle size={16} /> EXTRA
              </button>

              {totalItemsFisicos > 1 ? (
                <button 
                  onClick={() => manejarCuentasAparte(venta)}
                  className="flex items-center justify-center gap-2 border-2 p-3 bg-white shadow-sm transition-all font-black text-[10px]"
                  style={{ borderRadius: '50px', borderColor: '#FF4081', color: '#FF4081', fontFamily: '"Nunito", sans-serif' }}
                >
                  <Split size={16} /> APARTE
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 p-3 rounded-full font-black text-[9px] uppercase italic bg-white/30" style={{ color: '#4A4A4A', opacity: 0.6 }}>
                  Último Item
                </div>
              )}

              <button 
                onClick={() => {
                  const fechaCanceladoString = obtenerFechaLocalHoy();
                  procesarPagoEfectivo(
                    `COBRAR CUENTA - ${venta.cliente}`, 
                    venta.totalAcumulado || 0, 
                    () => alCobrar(venta.idFB, fechaCanceladoString)
                  );
                }}
                className="col-span-2 text-white p-4 font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                style={{ 
                  backgroundColor: '#FF4081', 
                  borderRadius: '50px', 
                  boxShadow: '0 4px 12px rgba(255, 64, 129, 0.3)',
                  fontFamily: '"Nunito", "Fredoka One", sans-serif'
                }}
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