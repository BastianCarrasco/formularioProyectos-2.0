// stores/auth.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null, // Guardará el objeto completo del usuario (académico o estudiante)
    userRole: null, // 'academico' o 'estudiante'
    isAuthenticated: false, // Para saber si hay un usuario autenticado
  }),
  actions: {
    // Acción para guardar la información del académico
    setAcademicInfo(academic) {
      this.user = {
        _id: academic._id,
        nombre: academic.nombre,
        a_paterno: academic.a_paterno,
        a_materno: academic.a_materno,
        email: academic.email,
        unidad: academic.unidad, // Asumiendo que esta propiedad existe en ambos
        // Puedes copiar otros campos relevantes del académico si es necesario
      };
      this.userRole = "academico";
      this.isAuthenticated = true;
      console.log(
        "Pinia Store: Información de académico guardada:",
        this.user.nombre,
        this.user.a_paterno
      );
    },

    // Nueva acción para guardar la información del estudiante (¡esta es la que faltaba!)
    setStudentInfo(student) {
      this.user = {
        _id: student._id,
        nombre: student.nombre,
        a_paterno: student.a_paterno,
        a_materno: student.a_materno,
        email: student.email,
        unidad: student.unidad, // Asumiendo que esta propiedad existe en ambos
        // Puedes copiar otros campos relevantes del estudiante si es necesario
      };
      this.userRole = "estudiante";
      this.isAuthenticated = true;
      console.log(
        "Pinia Store: Información de estudiante guardada:",
        this.user.nombre,
        this.user.a_paterno
      );
    },

    // Acción para establecer el rol (opcional, ya se hace en setAcademicInfo/setStudentInfo)
    setUserRole(role) {
      this.userRole = role;
    },

    // Acción para limpiar toda la información de autenticación
    clearAuthInfo() {
      this.user = null;
      this.userRole = null;
      this.isAuthenticated = false;
      console.log("Pinia Store: Información de autenticación limpiada.");
    },
  },
  // Opcional: Persistencia con Pinia-Plugin-Persistedstate (si quieres que sobreviva a recargas)
  // persist: true,
});
