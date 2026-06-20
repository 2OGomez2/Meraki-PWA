import React from 'react';
import { CheckCircle, Receipt, MessageSquare, Eye, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Solventes({ ventasFinalizadas }) {
  
  // 1. FILTRO INTERNO: Para las tarjetas principales de la lista, solo queremos las cuentas padre
  const cuentasPrincipales = ventasFinalizadas.filter(v => !v.idPadre);

  if (!cuentasPrincipales || cuentasPrincipales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[70vh]" style={{ backgroundColor: '#FFF8F0' }}>
        <CheckCircle size={64} className="mb-4 opacity-20" style={{ color: '#FF4081' }} />
        <p className="font-black uppercase tracking-widest text-xs italic text-center" style={{ color: '#4A4A4A' }}>
          No hay cobros realizados aún
        </p>
      </div>
    );
  }

  const verDesgloseCompleto = (ticketPrincipal) => {
    // 2. Aquí buscamos en TODO el universo de ventasFinalizadas (que ahora sí incluye los abonos)
    const todosLosCobros = ventasFinalizadas.filter(v => 
      v.idFB === ticketPrincipal.idFB || 
      v.idPadre === ticketPrincipal.idFB ||
      v.idPadre === ticketPrincipal.idOrden
    );

    // Ordenamos cronológicamente por id
    todosLosCobros.sort((a, b) => a.id - b.id);

    const cantidadCobros = todosLosCobros.length;
    
    // Calculamos el Gran Total real sumando lo que costó cada cobro individualizado
    const granTotalCuenta = todosLosCobros.reduce((acc, c) => {
      const items = c.pagos?.[0]?.items || c.items || [];
      const totalTransaccion = items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
      return acc + totalTransaccion;
    }, 0);

    // 3. Renderizado del SweetAlert dinámico con la línea de diseño de Meraki
    Swal.fire({
      title: `CUENTA: ${ticketPrincipal.cliente}`,
      html: `
        <div style="text-align: left; font-family: 'Nunito', sans-serif; max-height: 420px; overflow-y: auto; padding-right: 5px; color: #4A4A4A;">
          
          <p style="font-size: 11px; font-weight: 800; color: #4A4A4A; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.05em; opacity: 0.8;">
            Se registraron ${cantidadCobros} transacciones para esta mesa:
          </p>

          ${todosLosCobros.map((cobro, index) => {
            const productosCobro = cobro.pagos?.[0]?.items || cobro.items || [];
            const subtotalCobro = productosCobro.reduce((sum, i) => sum + (i.precioUnitario * i.cantidad), 0);
            const fechaDocumento = cobro.fechaCancelado || cobro.fecha || '---';

            return `
              <div style="margin-bottom: 12px; padding: 14px; border: 2px solid #FFEBD9; background: ${cobro.esPagoParcial ? '#FFF8F0' : 'rgba(52, 199, 89, 0.1)'}; border-radius: 1.5rem;">
                
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 900; color: #4A4A4A; margin-bottom: 8px; text-transform: uppercase;">
                  <span>${cobro.esPagoParcial ? `Cobro Parcial #${index + 1}` : 'Liquidación Final'}</span>
                  <span style="color: #FF4081; background-color: rgba(255, 64, 129, 0.1); padding: 2px 8px; border-radius: 20px;">
                    📅 ${fechaDocumento} &nbsp; 🕒 ${cobro.horaFinalizacion || cobro.hora || '--:--'}
                  </span>
                </div>

                <div style="margin-bottom: 6px;">
                  ${productosCobro.map(item => `
                    <div style="margin-bottom: 4px;">
                      <div style="display: flex; justify-content: space-between; font-size: 13px; color: #4A4A4A;">
                        <span><strong style="color: #FF4081;">${item.cantidad}x</strong> ${item.nombre}</span>
                        <span style="font-weight: 800; color: #4A4A4A;">$${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                      </div>
                      
                      <div style="margin-left: 20px; font-size: 10px; display: flex; flex-direction: column; gap: 2px; margin-top: 1px;">
                        ${item.aderezos && item.aderezos.length > 0 ? `<span style="color: #E6144A; font-weight: bold; text-transform: uppercase;">Aderezos: ${item.aderezos.join(', ')}</span>` : ''}
                        ${item.nota ? `<span style="color: #FF4081; font-style: italic;">📝 ${item.nota}</span>` : ''}
                        ${item.modificadores && item.modificadores.length > 0 ? `<span style="color: #4A4A4A; font-style: italic; opacity: 0.6;">+ ${item.modificadores.join(', ')}</span>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>

                <div style="text-align: right; font-weight: 900; font-size: 13px; margin-top: 8px; border-top: 2px dashed #FFEBD9; padding-top: 6px; color: #4A4A4A;">
                  Monto Pagado: $${subtotalCobro.toFixed(2)}
                </div>
              </div>
            `;
          }).join('')}

          <div style="margin-top: 16px; padding: 16px; background: #FF4081; color: white; border-radius: 1.5rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(255, 64, 129, 0.3);">
            <div>
              <span style="font-weight: 900; font-size: 10px; tracking-widest: 0.1em; display: block; text-transform: uppercase; opacity: 0.9;">TOTAL GENERAL</span>
              <span style="font-size: 11px; color: #FFEBD9; font-weight: bold;">(${cantidadCobros} Cobros Totales)</span>
            </div>
            <span style="font-size: 24px; font-weight: 900; color: #FFF8F0; font-family: 'Fredoka One', sans-serif;">$${granTotalCuenta.toFixed(2)}</span>
          </div>

        </div>
      `,
      confirmButtonText: 'CERRAR DETALLES',
      confirmButtonColor: '#4A4A4A',
      customClass: {
        popup: 'rounded-[2.5rem]'
      },
      didOpen: () => {
        Swal.getPopup().style.backgroundColor = '#FFF8F0';
      }
    });
  };

  return (
    <div className="space-y-6 p-2 min-h-[88vh]" style={{ backgroundColor: '#FFF8F0' }}>
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="text-2xl font-black tracking-tighter italic uppercase" style={{ color: '#4A4A4A', fontFamily: '"Nunito", sans-serif' }}>
            Ventas Pagadas
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#4A4A4A', opacity: 0.6 }}>
            Historial Unificado
          </p>
        </div>
        <span className="text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest shadow-sm" style={{ backgroundColor: '#34C759' }}>
          {cuentasPrincipales.length} CUENTAS
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cuentasPrincipales.map((venta) => {
          // MODIFICACIÓN DE CÁLCULO: Escaneamos todo el historial para sumar los cobros asociados a este padre
          const todosMisCobros = ventasFinalizadas.filter(v => 
            v.idFB === venta.idFB || v.idPadre === venta.idFB || v.idPadre === venta.idOrden
          );

          // Sumamos los subtotales de cada ticket individual para obtener el total general acumulado
          const totalGeneralHistorico = todosMisCobros.reduce((acc, cobro) => {
            const items = cobro.pagos?.[0]?.items || cobro.items || [];
            return acc + items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
          }, 0);

          const nCobros = todosMisCobros.length;
          const fechaPrincipal = venta.fechaCancelado || venta.fecha || '---';

          return (
            <div 
              key={venta.idFB}
              onClick={() => verDesgloseCompleto(venta)}
              className="p-5 flex justify-between items-center cursor-pointer transition-all active:scale-[0.99] rounded-[2rem] border"
              style={{ 
                backgroundColor: '#FFEBD9', 
                borderColor: '#FFEBD9',
                boxShadow: '0 4px 10px rgba(255, 180, 150, 0.15)'
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/60" style={{ color: '#FF4081' }}>
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-black uppercase text-sm tracking-tight" style={{ color: '#4A4A4A', fontFamily: '"Nunito", sans-serif' }}>
                    {venta.cliente}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold mt-1">
                    <span className="px-2 py-0.5 rounded-full font-black text-[9px] bg-white/50" style={{ color: '#4A4A4A' }}>
                      📅 {fechaPrincipal}
                    </span>
                    <span className="flex items-center gap-0.5" style={{ color: '#4A4A4A', opacity: 0.7 }}>
                      <Clock size={10}/> {venta.horaFinalizacion || "Finalizado"}
                    </span>
                    {nCobros > 1 && (
                      <span className="text-white px-2 py-0.5 rounded-full font-black text-[9px] shadow-sm animate-pulse" style={{ backgroundColor: '#FF4081' }}>
                        {nCobros} PAGOS
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[8px] font-black block uppercase tracking-wider" style={{ color: '#4A4A4A', opacity: 0.6 }}>
                    Ver Desglose
                  </span>
                  <span className="font-black text-lg" style={{ color: '#E6144A', fontFamily: '"Fredoka One", sans-serif' }}>
                    ${totalGeneralHistorico.toFixed(2)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/40" style={{ color: '#4A4A4A', opacity: 0.5 }}>
                  <Eye size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}