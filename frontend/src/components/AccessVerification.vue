<template>
    <div class="access-verification-card">
        <h2 class="card-title">Verificación de Acceso</h2>
        <p class="card-description">
            Por favor, selecciona si eres parte del cuerpo académico de la Pontificia
            Universidad Católica de Valparaíso o un colaborador externo.
        </p>
        <form @submit.prevent="continueAccess">
            <div class="radio-option">
                <input type="radio" id="isAcademic" value="academic" v-model="userType" />
                <label for="isAcademic">Sí, soy parte del cuerpo académico</label>
            </div>
            <div class="radio-option">
                <input type="radio" id="isNotAcademic" value="external" v-model="userType" />
                <label for="isNotAcademic">No, no soy parte del cuerpo académico</label>
            </div>
            <button type="submit" class="continue-button" :disabled="!userType">
                Continuar
            </button>
        </form>
    </div>
</template>

<script>
import '../assets/AccessVerification.css';
export default {
    name: 'AccessVerification',
    data() {
        return {
            userType: null, // 'academic' or 'external'
        };
    },
    methods: {
        continueAccess() {
            if (!this.userType) {
                alert('Por favor, selecciona una opción.');
                return;
            }

            if (this.userType === 'academic') {
                this.$router.push('/verify-email');
            } else if (this.userType === 'external') {
                // Redirigir al nuevo formulario de registro para colaboradores externos
                this.$router.push('/external-registration');
            }
        },
    },
};
</script>
