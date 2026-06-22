import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Save, X, Search, Settings } from 'lucide-react';
import Swal from 'sweetalert2';
import { db } from '../firebaseConfig';
import { collection, addDoc, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';

const CATEGORIAS_BASE = [
  "Bebidas",
  "Hamburguesas y Sandwich",
  "Papas,Dedos de queso y Rollitos",
  "Alitas"
];

export default function GestionMenu({ productos = [] }) {
  const [nombreInput, setNombreInput] = useState('');
  const [precioInput, setPrecioInput] = useState('');
  const [categoriaMadre, setCategoriaMadre] = useState('Bebidas');
  const [aderezosGratisInput, setAderezosGratisInput] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  // Estados para creación y edición global de categorías
  const [creandoNuevaCat, setCreandoNuevaCat] = useState(false);
  const [nuevaCategoriaInput, setNuevaCategoriaInput] = useState('');
  
  const [editandoCatExistente, setEditandoCatExistente] = useState(false);
  const [catAEditarSeleccionada, setCatAEditarSeleccionada] = useState('Bebidas');
  const [nuevoNombreCatInput, setNuevoNombreCatInput] = useState('');

  // Generar lista única de categorías leyendo Firebase en tiempo real
  const categoriasDinamicas = [
    ...new Set([
      ...CATEGORIAS_BASE,
      ...productos.map(p => p.categoriaMadre).filter(Boolean)
    ])
  ];

  // --- 1. GUARDAR O ACTUALIZAR PRODUCTO SINGLE ---
  const guardarProducto = async (e) => {
    e.preventDefault();
    if (!nombreInput.trim() || !precioInput) {
      return Swal.fire('Error', 'Por favor llena todos los campos.', 'error');
    }

    const precioNum = parseFloat(precioInput);
    if (isNaN(precioNum) || precioNum <= 0) {
      return Swal.fire('Error', 'Ingresa un precio válido.', 'error');
    }

    let categoriaFinal = creandoNuevaCat ? nuevaCategoriaInput.trim() : categoriaMadre;

    if (!categoriaFinal) {
      return Swal.fire('Error', 'Por favor selecciona o escribe una categoría.', 'error');
    }

    const esAlitasCat = categoriaFinal === "Alitas";
    const aderezosGratisNum = esAlitasCat ? parseInt(aderezosGratisInput) || 0 : 0;

    try {
      if (editandoId) {
        const productoRef = doc(db, 'menu', editandoId);
        await updateDoc(productoRef, {
          nombre: nombreInput.trim().toUpperCase(),
          precioUnitario: precioNum,
          categoriaMadre: categoriaFinal,
          aderezosGratis: aderezosGratisNum
        });
        setEditandoId(null);
        Swal.fire({ icon: 'success', title: '¡Producto Actualizado!', timer: 1500, showConfirmButton: false });
      } else {
        await addDoc(collection(db, 'menu'), {
          nombre: nombreInput.trim().toUpperCase(),
          precioUnitario: precioNum,
          categoriaMadre: categoriaFinal,
          aderezosGratis: aderezosGratisNum
        });
        Swal.fire({ icon: 'success', title: '¡Producto Añadido!', timer: 1500, showConfirmButton: false });
      }

      setNombreInput('');
      setPrecioInput('');
      setAderezosGratisInput('');
      setNuevaCategoriaInput('');
      setCreandoNuevaCat(false);
    } catch (error) {
      console.error("Error al procesar producto:", error);
      Swal.fire('Error', 'No se pudo guardar el producto.', 'error');
    }
  };

  // --- 2. MODIFICAR NOMBRE DE CATEGORÍA EXISTENTE (AFECTA TODOS LOS PRODUCTOS) ---
  const manejarEditarCategoriaExistente = async (e) => {
    e.preventDefault();
    const nombreNuevoCat = nuevoNombreCatInput.trim();

    if (!nombreNuevoCat) {
      return Swal.fire('Error', 'Escribe el nuevo nombre para la categoría.', 'error');
    }

    // Buscar todos los productos que actualmente usan la categoría vieja
    const productosAAfectar = productos.filter(p => p.categoriaMadre === catAEditarSeleccionada);

    Swal.fire({
      title: '¿Confirmar cambio de nombre?',
      text: `Se renombrará "${catAEditarSeleccionada}" a "${nombreNuevoCat}". Esto afectará a ${productosAAfectar.length} productos automáticamente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f4244c',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'SÍ, ACTUALIZAR TODO',
      cancelButtonText: 'CANCELAR'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Usamos un Batch de Firestore para actualizar todos los documentos afectados en un solo viaje limpio
          const batch = writeBatch(db);
          
          productosAAfectar.forEach(prod => {
            const prodRef = doc(db, 'menu', prod.id);
            batch.update(prodRef, { categoriaMadre: nombreNuevoCat });
          });

          await batch.commit();

          Swal.fire('¡Categoría Actualizada!', 'La categoría y todos sus productos asociados fueron migrados con éxito.', 'success');
          
          // Resetear estados de edición de categorías
          setNuevoNombreCatInput('');
          setEditandoCatExistente(false);
          setCategoriaMadre(nombreNuevoCat); // Dejar seleccionada la nueva por defecto
        } catch (error) {
          console.error("Error al actualizar categoría masivamente:", error);
          Swal.fire('Error', 'Ocurrió un problema al renombrar la categoría de los productos.', 'error');
        }
      }
    });
  };

  // --- 3. PREPARAR EDICIÓN DE PRODUCTO ---
  const seleccionarParaEditar = (prod) => {
    setEditandoId(prod.id);
    setNombreInput(prod.nombre || '');
    setPrecioInput(prod.precioUnitario ? prod.precioUnitario.toString() : '');
    setCategoriaMadre(prod.categoriaMadre || 'Bebidas');
    setAderezosGratisInput(prod.aderezosGratis !== undefined ? prod.aderezosGratis.toString() : '');
    setCreandoNuevaCat(false);
    setEditandoCatExistente(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 4. CANCELAR EDICIÓN ---
  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombreInput('');
    setPrecioInput('');
    setCategoriaMadre('Bebidas');
    setAderezosGratisInput('');
    setCreandoNuevaCat(false);
    setEditandoCatExistente(false);
  };

  // --- 5. ELIMINAR PRODUCTO ---
  const eliminarProducto = (id, nombreProd) => {
    Swal.fire({
      title: '¿Está seguro de querer eliminar?',
      text: `Vas a borrar permanentemente: "${nombreProd}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f4244c',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'SÍ, BORRAR',
      cancelButtonText: 'CANCELAR',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, 'menu', id));
          Swal.fire('¡Eliminado!', `"${nombreProd}" ha sido removido del catálogo.`, 'success');
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
        }
      }
    });
  };

  const textBusqueda = busqueda.toLowerCase();
  const productosFiltrados = productos.filter(p => {
    const nombre = (p.nombre || '').toLowerCase();
    const categoria = (p.categoriaMadre || 'Sin Categoría').toLowerCase();
    return nombre.includes(textBusqueda) || categoria.includes(textBusqueda);
  });

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-6 font-sans">
      
      {/* 📋 FORMULARIO DE GESTIÓN */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h2 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-4">
          {editandoId ? '⚡ Modificando Producto' : '📋 Gestión de Catálogo de Productos'}
        </h2>
        
        {/* INTERFAZ ALTERNATIVA: EDITAR NOMBRE DE CATEGORÍA EXISTENTE */}
        {editandoCatExistente ? (
          <form onSubmit={manejarEditarCategoriaExistente} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 base-animation">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-500">✏️ Editar Nombre de Categoría Existente</span>
              <button 
                type="button" 
                onClick={() => setEditandoCatExistente(false)}
                className="text-[10px] font-black text-[#f4244c] uppercase hover:underline"
              >
                ✕ Volver al formulario
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1">Selecciona la Categoría a Cambiar</label>
                <select
                  value={catAEditarSeleccionada}
                  onChange={e => setCatAEditarSeleccionada(e.target.value)}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#f4244c]"
                >
                  {categoriasDinamicas.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1">Nuevo Nombre de la Categoría</label>
                <input
                  type="text"
                  value={nuevoNombreCatInput}
                  onChange={e => setNuevoNombreCatInput(e.target.value)}
                  placeholder="EJ. BEBIDAS FRÍAS"
                  className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-[#f4244c]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Actualizar Nombre e Ir a Productos
              </button>
            </div>
          </form>
        ) : (
          /* FORMULARIO ESTÁNDAR DE AGREGAR/EDITAR PRODUCTO */
          <form onSubmit={guardarProducto} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1">Nombre del Producto</label>
                <input 
                  type="text" 
                  value={nombreInput}
                  onChange={e => setNombreInput(e.target.value)}
                  placeholder="EJ. HAMBURGUESA DOBLE CARNE" 
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-[#f4244c] transition-all"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1">Precio Unitario ($)</label>
                <input 
                  type="number" 
                  step="any"
                  value={precioInput}
                  onChange={e => setPrecioInput(e.target.value)}
                  placeholder="0.00" 
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none focus:border-[#f4244c] transition-all"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Categoría</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditandoCatExistente(true);
                        setCreandoNuevaCat(false);
                      }}
                      className="text-[9px] font-black uppercase text-slate-500 hover:text-slate-700 hover:underline"
                    >
                       Editar Nombre
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreandoNuevaCat(!creandoNuevaCat)}
                      className="text-[9px] font-black uppercase text-[#f4244c] hover:underline"
                    >
                      {creandoNuevaCat ? '✕ Lista' : '+ Nueva'}
                    </button>
                  </div>
                </div>

                {creandoNuevaCat ? (
                  <input
                    type="text"
                    value={nuevaCategoriaInput}
                    onChange={e => setNuevaCategoriaInput(e.target.value)}
                    placeholder="ESCRIBE LA NUEVA CATEGORÍA"
                    className="p-3 bg-rose-50/40 border border-rose-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-[#f4244c] transition-all"
                  />
                ) : (
                  <select 
                    value={categoriaMadre}
                    onChange={e => setCategoriaMadre(e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#f4244c] transition-all"
                  >
                    {categoriasDinamicas.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* CAMPO DINÁMICO ADEREZOS GRATIS */}
            {((creandoNuevaCat && nuevaCategoriaInput === "Alitas") || (!creandoNuevaCat && categoriaMadre === "Alitas")) && (
              <div className="flex flex-col max-w-sm animation-fade-in">
                <label className="text-[10px] font-black uppercase text-[#f4244c] mb-1">
                  ¿Cuántos aderezos incluye gratis este producto?
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={aderezosGratisInput}
                  onChange={e => setAderezosGratisInput(e.target.value)}
                  placeholder="Ej. 1 para el de 6, 2 para el de 12" 
                  className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl text-xs font-bold outline-none focus:border-[#f4244c] transition-all"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              {editandoId && (
                <button 
                  type="button" 
                  onClick={cancelarEdicion}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
                >
                  <X size={14} /> Cancelar
                </button>
              )}
              <button 
                type="submit" 
                className="flex items-center gap-1.5 bg-[#f4244c] hover:bg-[#d61b3f] text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md"
              >
                {editandoId ? <Save size={14} /> : <Plus size={14} />}
                {editandoId ? 'Guardar Cambios' : 'Agregar Producto'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 🔍 BUSCADOR Y TABLA DE PRODUCTOS */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 tracking-tight">Vista general del catálogo activo</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Productos registrados: ({productosFiltrados.length})</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o categoría..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#f4244c] w-full sm:w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                <th className="p-3">Categoría</th>
                <th className="p-3">Producto</th>
                <th className="p-3 text-right">Precio Unitario</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-100">
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400 italic bg-slate-50/50">
                    No se encontraron productos en esta categoría o catálogo.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-all">
                    <td className="p-3 text-slate-400 uppercase text-[10px] tracking-wide">
                      {p.categoriaMadre || 'Sin Categoría'}
                      {p.categoriaMadre === "Alitas" && p.aderezosGratis > 0 && (
                        <span className="block text-[8px] text-emerald-600 font-black mt-0.5 uppercase tracking-tighter">
                          ({p.aderezosGratis} Gratis)
                        </span>
                      )}
                    </td>
                    <td className="p-3 uppercase text-slate-800 font-black tracking-tight">{p.nombre}</td>
                    <td className="p-3 text-right text-[#f4244c] font-black">${parseFloat(p.precioUnitario || 0).toFixed(2)}</td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => seleccionarParaEditar(p)} 
                          className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => eliminarProducto(p.id, p.nombre)} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}