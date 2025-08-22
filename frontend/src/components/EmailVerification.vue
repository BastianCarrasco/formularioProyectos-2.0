<template>
    <div class="email-verification-card">
        <h2 class="card-title">Verificación de Email</h2>
        <p class="card-description">
            Por favor, ingrese su correo electrónico para verificar su identidad.
        </p>

        <form @submit.prevent="verifyEmail">
            <div class="form-group">
                <label for="email">Correo Electrónico:</label>
                <input type="email" id="email" v-model.trim="email" placeholder="ej. tunombre@dominio.cl" required
                    class="email-input" @input="emailError = ''" />
                <p v-if="emailError" class="error-message">{{ emailError }}</p>
            </div>

            <div class="button-group">
                <button type="button" @click="goBack" class="btn-secondary">
                    Volver
                </button>
                <button type="submit" class="btn-primary" :disabled="!email || isLoading">
                    {{ isLoading ? 'Verificando...' : 'Verificar Email' }}
                </button>
            </div>

            <p v-if="successMessage" class="success-message">
                {{ successMessage }}
            </p>
            <p v-if="apiError" class="error-message">{{ apiError }}</p>
        </form>
    </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'; // <-- Importa tu store
import "../assets/EmailVerification.css"

export default {
    name: 'EmailVerification',
    data() {
        return {
            email: '',
            emailError: '',
            isLoading: false,
            apiError: '',
            successMessage: '',
            URL_ACADEMICOS: import.meta.env.VITE_URL_ACADEMICOS,
            URL_ESTUDIANTES: import.meta.env.VITE_URL_ESTUDIANTES, // <-- Nueva URL para estudiantes
        };
    },
    methods: {
        goBack() {
            // Puedes decidir a dónde ir, por ahora volvemos a la raíz
            this.$router.push('/');
        },
        async verifyEmail() {
            this.emailError = '';
            this.apiError = '';
            this.successMessage = '';

            // Ya no hay validación de formato de email institucional aquí,
            // pero podríamos añadir una validación de formato de email básico si es necesario.
            if (!this.email) {
                this.emailError = 'El correo electrónico es requerido.';
                return;
            }
            // Opcional: Validación básica de formato de email si no se hace a nivel de input 'email'
            // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // if (!emailRegex.test(this.email)) {
            //     this.emailError = 'Por favor, introduce un formato de correo electrónico válido.';
            //     return;
            // }


            this.isLoading = true;
            try {
                const authStore = useAuthStore();
                let userFound = null;
                let userRole = null;

                // 1. Intentar buscar en académicos
                const academicResponse = await fetch(this.URL_ACADEMICOS);
                if (!academicResponse.ok) {
                    throw new Error(`Error al cargar académicos: HTTP status ${academicResponse.status}`);
                }
                const academicsData = await academicResponse.json();
                userFound = academicsData.find(
                    (academico) => academico.email === this.email
                );

                if (userFound) {
                    userRole = 'academico';
                } else {
                    // 2. Si no se encontró como académico, intentar buscar en estudiantes
                    const studentResponse = await fetch(this.URL_ESTUDIANTES);
                    if (!studentResponse.ok) {
                        throw new Error(`Error al cargar estudiantes: HTTP status ${studentResponse.status}`);
                    }
                    const studentsData = await studentResponse.json();
                    userFound = studentsData.find(
                        (estudiante) => estudiante.email === this.email
                    );

                    if (userFound) {
                        userRole = 'estudiante';
                    }
                }


                if (userFound) {
                    this.successMessage = `¡Email verificado como ${userRole}! Redirigiendo...`;

                    // Almacena la información del usuario en el store
                    if (userRole === 'academico') {
                        authStore.setAcademicInfo(userFound);
                    } else if (userRole === 'estudiante') {
                        authStore.setStudentInfo(userFound); // Asume que tienes un setStudentInfo en tu store
                    }
                    authStore.setUserRole(userRole); // Guarda el rol del usuario

                    // Redirige al ProjectForm
                    this.$router.push({ name: 'ProjectForm' });
                } else {
                    this.apiError = 'Email no encontrado en la base de datos de académicos ni estudiantes.';
                }
            } catch (error) {
                console.error('Error al verificar el email:', error);
                this.apiError =
                    `Hubo un error al conectar con el servidor: ${error.message}. Intente de nuevo.`;
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style scoped></style>