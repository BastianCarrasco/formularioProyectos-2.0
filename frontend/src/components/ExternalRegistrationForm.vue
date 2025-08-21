<template>
    <div class="external-registration-container">
        <h2 class="card-title">Registro de Colaborador Externo</h2>
        <p class="card-description">
            Para completar su registro, por favor, primero seleccione su Unidad
            Académica o añada una nueva si no la encuentra. Luego, complete sus datos
            personales.
        </p>

        <form @submit.prevent="registerAndAccess">
            <div class="form-grid">
                <!-- Paso 1: Información de Unidad y Tipo de Colaborador -->
                <div class="form-column step-1">
                    <h3>Paso 1: Información de Unidad</h3>

                    <div class="form-group">
                        <label for="userRole">Tipo de Colaborador: <span class="required">*</span></label>
                        <select id="userRole" v-model="formData.userRole" required class="select-field">
                            <option value="" disabled>Seleccione el tipo</option>
                            <option value="estudiante">Estudiante</option>
                            <option value="academico">Académico</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="unidadAcademica">Unidad Académica (opcional):</label>
                        <select id="unidadAcademica" v-model="formData.selectedUnitId" class="select-field"
                            :disabled="loadingUnits">
                            <option value="">Ninguna / No pertenece a una unidad</option>
                            <option v-for="unit in academicUnits" :key="unit._id" :value="unit.nombre">
                                {{ unit.nombre }}
                            </option>
                        </select>
                        <p v-if="loadingUnits" class="loading-message">
                            Cargando unidades académicas...
                        </p>
                        <p v-if="unitsError" class="error-message">
                            {{ unitsError }}
                        </p>
                    </div>
                </div>

                <!-- Paso 2: Datos Personales -->
                <div class="form-column step-2">
                    <h3>Paso 2: Datos Personales</h3>
                    <div class="form-group">
                        <label for="nombre">Nombre: <span class="required">*</span></label>
                        <input type="text" id="nombre" v-model="formData.nombre" required class="input-field" />
                    </div>
                    <div class="form-group">
                        <label for="apellidoPaterno">Apellido Paterno: <span class="required">*</span></label>
                        <input type="text" id="apellidoPaterno" v-model="formData.apellidoPaterno" required
                            class="input-field" />
                    </div>
                    <div class="form-group">
                        <label for="apellidoMaterno">Apellido Materno:</label>
                        <input type="text" id="apellidoMaterno" v-model="formData.apellidoMaterno"
                            class="input-field" />
                    </div>
                    <div class="form-group">
                        <label for="correoElectronico">Correo Electrónico: <span class="required">*</span></label>
                        <input type="email" id="correoElectronico" v-model="formData.correoElectronico" required
                            class="input-field" />
                    </div>
                </div>
            </div>

            <div class="form-actions-bottom">
                <button type="button" class="btn-volver" @click="goBack">Volver</button>
                <button type="submit" class="btn-submit" :disabled="!isFormValid">
                    Registrar y Acceder al Cuestionario
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import '../assets/ExternalRegistrationForm.css'; // Mantenemos el archivo CSS

export default {
    name: 'ExternalRegistrationForm',
    data() {
        return {
            academicUnits: [], // Ahora se cargará desde la API
            loadingUnits: false,
            unitsError: '',
            formData: {
                userRole: '', // Nuevo campo para 'estudiante' o 'academico'
                selectedUnitId: '',
                nombre: '',
                apellidoPaterno: '',
                apellidoMaterno: '',
                correoElectronico: '',
            },
            URL_UA: import.meta.env.VITE_URL_UA, // URL para unidades académicas
        };
    },
    computed: {
        isFormValid() {
            // Ahora el rol también es requerido para la validación
            return (
                this.formData.userRole.trim() !== '' && // El rol debe estar seleccionado
                this.formData.nombre.trim() !== '' &&
                this.formData.apellidoPaterno.trim() !== '' &&
                this.formData.correoElectronico.trim() !== '' &&
                this.isValidEmail(this.formData.correoElectronico)
            );
        },
    },
    async created() {
        // Cargamos las unidades académicas cuando el componente es creado
        await this.fetchAcademicUnits();
    },
    methods: {
        isValidEmail(email) {
            const re =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        },
        async fetchAcademicUnits() {
            this.loadingUnits = true;
            this.unitsError = '';
            try {
                const response = await fetch(this.URL_UA);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // Asume que la API devuelve un array de objetos con `_id` y `nombre`
                this.academicUnits = data;
            } catch (error) {
                console.error('Error al cargar unidades académicas:', error);
                this.unitsError =
                    'No se pudieron cargar las unidades académicas. Intente recargar la página.';
            } finally {
                this.loadingUnits = false;
            }
        },
        goBack() {
            this.$router.go(-1);
        },
        registerAndAccess() {
            if (this.isFormValid) {
                console.log('Datos del formulario de registro externo:', this.formData);
                alert(
                    `Registro de colaborador externo (${this.formData.userRole}) exitoso. Redirigiendo al cuestionario.`
                );
                // Aquí iría la lógica para enviar los datos al backend
                // this.$router.push('/cuestionario-externo');
            } else {
                alert(
                    'Por favor, completa todos los campos requeridos y asegúrate que el email sea válido.'
                );
            }
        },
    },
};
</script>

<style scoped>
/*
  Los estilos ahora están en src/assets/ExternalRegistrationForm.css
  Puedes añadir estilos específicos aquí si es necesario, pero
  asegúrate de que el ExternalRegistrationForm.css se haya recreado correctamente.
*/
.loading-message,
.error-message {
    text-align: center;
    font-size: 0.9em;
    margin-top: 10px;
}

.loading-message {
    color: #007bff;
}

.error-message {
    color: #dc3545;
}
</style>