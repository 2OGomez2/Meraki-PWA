import React, { useState, useEffect } from "react";
import {
  registrarUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../services/userService";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Swal from "sweetalert2";
import { UserPlus, Eye, EyeOff, Edit, Trash2, Users } from "lucide-react";

export const GestionUsuarios = () => {
  // Estados para Registro
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Estado para Lista de Usuarios
  const [usuarios, setUsuarios] = useState([]);

  // Cargar lista de empleados en tiempo real
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("nombre", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(lista);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !email || !password) {
      Swal.fire("Atención", "Por favor completa todos los campos", "warning");
      return;
    }

    setCargando(true);
    try {
      await registrarUsuario(email, password, nombre, role);

      Swal.fire({
        title: "¡Usuario Creado!",
        text: `El usuario ${nombre} ha sido registrado exitosamente.`,
        icon: "success",
        confirmButtonColor: "#FF4081",
        customClass: { popup: "rounded-[2rem]" },
        didOpen: () => {
          Swal.getPopup().style.backgroundColor = "#FFF8F0";
        },
      });

      setNombre("");
      setEmail("");
      setPassword("");
      setRole("employee");
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo crear el usuario.",
        icon: "error",
        confirmButtonColor: "#FF4081",
        customClass: { popup: "rounded-[2rem]" },
      });
    } finally {
      setCargando(false);
    }
  };

  // Handler para Editar (solo Nombre, Correo y Rol)
  const handleEditar = (usuario) => {
    Swal.fire({
      title: "Editar Empleado",
      html: `
        <div style="text-align: left;" class="space-y-3 font-sans">
          <div>
            <label style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #4A4A4A;">Nombre Completo</label>
            <input id="edit-nombre" class="swal2-input" value="${usuario.nombre || ""}" placeholder="Nombre" style="width: 100%; margin: 4px 0 12px 0;">
          </div>
          <div>
            <label style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #4A4A4A;">Correo Electrónico</label>
            <input id="edit-email" type="email" class="swal2-input" value="${usuario.email || ""}" placeholder="Correo" style="width: 100%; margin: 4px 0 12px 0;">
          </div>
          <div>
            <label style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #4A4A4A;">Rol</label>
            <select id="edit-role" class="swal2-select" style="width: 100%; margin-top: 4px;">
              <option value="employee" ${usuario.role === "employee" ? "selected" : ""}>Empleado (Acceso limitado)</option>
              <option value="admin" ${usuario.role === "admin" ? "selected" : ""}>Administrador (Acceso total)</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar Cambios",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#FF4081",
      cancelButtonColor: "#4A4A4A",
      customClass: { popup: "rounded-[2rem]" },
      didOpen: () => {
        Swal.getPopup().style.backgroundColor = "#FFF8F0";
      },
      preConfirm: () => {
        const nuevoNombre = document.getElementById("edit-nombre").value;
        const nuevoEmail = document.getElementById("edit-email").value;
        const nuevoRole = document.getElementById("edit-role").value;

        if (!nuevoNombre || !nuevoEmail) {
          Swal.showValidationMessage(
            "El nombre y el correo no pueden estar vacíos",
          );
          return false;
        }
        return { nombre: nuevoNombre, email: nuevoEmail, role: nuevoRole };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await actualizarUsuario(
            usuario.id,
            result.value.nombre,
            result.value.email,
            result.value.role,
          );
          Swal.fire({
            title: "Actualizado",
            text: "La información del empleado ha sido modificada.",
            icon: "success",
            confirmButtonColor: "#FF4081",
            customClass: { popup: "rounded-[2rem]" },
            didOpen: () => {
              Swal.getPopup().style.backgroundColor = "#FFF8F0";
            },
          });
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  // Handler para Eliminar
  const handleEliminar = (usuario) => {
    Swal.fire({
      title: "¿Eliminar empleado?",
      text: `Se removerá a ${usuario.nombre} del sistema.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E6144A",
      cancelButtonColor: "#4A4A4A",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: { popup: "rounded-[2rem]" },
      didOpen: () => {
        Swal.getPopup().style.backgroundColor = "#FFF8F0";
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarUsuario(usuario.id);
          Swal.fire({
            title: "Eliminado",
            text: "El empleado ha sido removido.",
            icon: "success",
            confirmButtonColor: "#4A4A4A",
            customClass: { popup: "rounded-[2rem]" },
            didOpen: () => {
              Swal.getPopup().style.backgroundColor = "#FFF8F0";
            },
          });
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto my-6">
      {/* 1. FORMULARIO DE REGISTRO */}
      <div className="bg-white p-6 rounded-3xl shadow-md border border-[#FFEBD9]">
        <div className="flex items-center gap-2 mb-6 text-[#FF4081]">
          <UserPlus size={24} />
          <h2 className="text-xl font-bold">Registrar Nuevo Personal</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Ej. Juan Pérez"
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FF4081]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="empleado@meraki.com"
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FF4081]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
              Contraseña Inicial
            </label>
            <div className="relative">
              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full p-2.5 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FF4081]"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF4081] transition-colors"
              >
                {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
              Rol de Acceso
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FF4081]"
            >
              <option value="employee">Empleado (Acceso limitado)</option>
              <option value="admin">Administrador (Acceso total)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-[#FF4081] hover:bg-[#e0356f] text-white font-bold rounded-xl shadow-md transition-all uppercase tracking-wider text-sm mt-4 disabled:opacity-50 cursor-pointer"
          >
            {cargando ? "Registrando..." : "Crear Usuario"}
          </button>
        </form>
      </div>

      {/* 2. LISTADO DE EMPLEADOS ACTUALES */}
      <div className="bg-white p-6 rounded-3xl shadow-md border border-[#FFEBD9]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#4A4A4A]">
            <Users size={22} className="text-[#FF4081]" />
            <h3 className="text-lg font-bold">Personal Actual</h3>
          </div>
          <span className="text-xs font-black bg-[#FFEBD9] text-[#4A4A4A] px-3 py-1 rounded-full">
            {usuarios.length} registrados
          </span>
        </div>

        {usuarios.length === 0 ? (
          <p className="text-center text-xs font-bold text-gray-400 py-6 uppercase tracking-wider">
            No hay personal registrado aún.
          </p>
        ) : (
          <div className="space-y-3">
            {usuarios.map((usr) => (
              <div
                key={usr.id}
                className="flex items-center justify-between p-3.5 border border-[#FFEBD9] rounded-2xl bg-[#FFF8F0]/50 hover:bg-white transition-all"
              >
                <div className="flex flex-col max-w-[200px] sm:max-w-xs">
                  <span className="font-bold text-sm text-gray-800 truncate">
                    {usr.nombre}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {usr.email}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider mt-0.5 text-[#FF4081]">
                    {usr.role === "admin" ? "Administrador" : "Empleado"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditar(usr)}
                    className="p-2 bg-white hover:bg-orange-50 border border-[#FFEBD9] rounded-xl text-gray-700 transition-colors shadow-sm cursor-pointer"
                    title="Editar nombre y correo"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleEliminar(usr)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-[#E6144A] transition-colors shadow-sm cursor-pointer"
                    title="Eliminar empleado"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
