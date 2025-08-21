import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    // Aquí guardaremos la información del académico
    academicFullName: "", // Para guardar "Nombre ApellidoPaterno"
    academicEmail: "",
    academicId: null, // Para guardar el _id si es necesario
    // Puedes añadir más campos de academicInfo si los necesitas globalmente
  }),
  actions: {
    // Acción para guardar la información del académico verificado
    setAcademicInfo(academic) {
      this.academicFullName = `${academic.nombre || ""} ${
        academic.a_paterno ? academic.a_paterno : ""
      }`.trim();
      this.academicEmail = academic.email;
      this.academicId = academic._id; // Guarda el ID si es relevante
      console.log(
        "Pinia Store: Información de académico guardada:",
        this.academicFullName
      );
    },
    // Acción para limpiar la información (ej. al cerrar sesión)
    clearAcademicInfo() {
      this.academicFullName = "";
      this.academicEmail = "";
      this.academicId = null;
      console.log("Pinia Store: Información de académico limpiada.");
    },
  },
  // Opcional: Persistencia con Pinia-Plugin-Persistedstate (si quieres que sobreviva a recargas)
  // Añadir al store o globalmente:
  // persist: true,
});
