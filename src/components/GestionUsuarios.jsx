import React, { useState } from "react";
import { registrarUsuario } from "../services/userService";
import Swal from "sweetalert2";
import { UserPlus, Eye, EyeOff } from "lucide-react";

export const GestionUsuarios = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !email || !password) {
      Swal.fire("Atención", "Por favor completa todos los campos", "warning");
      return;
    }

    setCargando(true);
    try {
      // Pasa los parámetros en el orden exacto: (email, password, nombre, role)
      await registrarUsuario(email, password, nombre, role);

      Swal.fire({
        title: "¡Usuario Creado!",
        text: `El usuario ${nombre} ha sido registrado exitosamente.`,
        icon: "success",
        confirmButtonColor: "#FF4081",
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
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-[#FFEBD9] my-6 max-w-lg mx-auto">
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
          className="w-full py-3 bg-[#FF4081] hover:bg-[#e0356f] text-white font-bold rounded-xl shadow-md transition-all uppercase tracking-wider text-sm mt-4 disabled:opacity-50"
        >
          {cargando ? "Registrando..." : "Crear Usuario"}
        </button>
      </form>
    </div>
  );
};
