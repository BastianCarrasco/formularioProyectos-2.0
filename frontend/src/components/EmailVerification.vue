<template>
    <div class="email-verification-card">
        <h2 class="card-title">Verificación de Email (Académico)</h2>
        <p class="card-description">
            Por favor, ingrese su correo electrónico institucional para verificar su
            identidad como académico de la PUCV.
        </p>

        <form @submit.prevent="verifyEmail">
            <div class="form-group">
                <label for="email">Correo Electrónico:</label>
                <input type="email" id="email" v-model.trim="email" placeholder="ej. tunombre@pucv.cl" required
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
        };
    },
    methods: {
        goBack() {
            this.$router.push('/');
        },
        async verifyEmail() {
            this.emailError = '';
            this.apiError = '';
            this.successMessage = '';

            if (!this.email.endsWith('@pucv.cl')) {
                this.emailError = 'El email debe ser institucional (@pucv.cl).';
                return;
            }

            this.isLoading = true;
            try {
                const response = await fetch(this.URL_ACADEMICOS);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                const foundAcademic = data.find(
                    (academico) => academico.email === this.email
                );

                if (foundAcademic) {
                    this.successMessage = `¡Email verificado! Redirigiendo...`;

                    // <-- CAMBIO CLAVE AQUÍ: Usa el store de Pinia
                    const authStore = useAuthStore();
                    authStore.setAcademicInfo(foundAcademic); // Guarda el objeto académico completo

                    // Ya no necesitamos pasar params aquí, la vista los tomará del store
                    this.$router.push({ name: 'ProjectForm' }); // Navega sin params
                } else {
                    this.apiError = 'Email no encontrado en la base de datos de académicos.';
                }
            } catch (error) {
                console.error('Error al verificar el email:', error);
                this.apiError =
                    'Hubo un error al conectar con el servidor. Intente de nuevo.';
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style scoped></style>