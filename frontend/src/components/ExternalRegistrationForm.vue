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
                    Registrar y Acceder a Verificador.
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
                selectedUnitId: '', // Esto ahora será el ID para enviar al backend
                nombre: '',
                apellidoPaterno: '',
                apellidoMaterno: '',
                correoElectronico: '',
            },
            URL_UA: import.meta.env.VITE_URL_UA, // URL para unidades académicas
            // Nuevas URLs para registro
            URL_ESTUDIANTES: import.meta.env.VITE_URL_ESTUDIANTES,
            URL_ACADEMICOS: import.meta.env.VITE_URL_ACADEMICOS,
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
        // Computed property to get the selected unit's name for the 'unidad' field
        selectedUnitNameForSubmission() {
            if (this.formData.selectedUnitId) {
                // Since v-model is bound to unit.nombre, formData.selectedUnitId already holds the name.
                // We just need to ensure it's not an empty string if "Ninguna" was selected.
                return this.formData.selectedUnitId !== ''
                    ? this.formData.selectedUnitId
                    : '';
            }
            return ''; // Return empty string if no unit is selected or if "Ninguna" is the value
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
        async registerAndAccess() {
            if (!this.isFormValid) {
                alert(
                    'Por favor, completa todos los campos requeridos y asegúrate que el email sea válido.'
                );
                return;
            }

            this.loadingUnits = true; // Usamos loadingUnits para indicar el estado de la solicitud
            this.unitsError = ''; // Limpiamos cualquier error previo

            try {
                let url = '';
                let payload = {
                    nombre: this.formData.nombre,
                    email: this.formData.correoElectronico, // Mapeado a 'email'
                    a_paterno: this.formData.apellidoPaterno, // Mapeado a 'a_paterno'
                    a_materno: this.formData.apellidoMaterno || '', // Mapeado a 'a_materno', asegurar string vacío si es null/undefined
                    unidad: this.selectedUnitNameForSubmission, // Mapeado a 'unidad'
                    link_foto: '', // Dejado vacío como se solicitó
                };

                if (this.formData.userRole === 'estudiante') {
                    url = this.URL_ESTUDIANTES;
                } else if (this.formData.userRole === 'academico') {
                    url = this.URL_ACADEMICOS;
                    // Asegurarse de que la unidad no sea vacía para académicos si es un campo requerido en el backend
                    if (!payload.unidad && this.formData.selectedUnitId !== '') {
                        throw new Error(
                            'Por favor, selecciona una Unidad Académica para el rol de Académico.'
                        );
                    }
                } else {
                    throw new Error(
                        'Tipo de colaborador no válido. Por favor, selecciona Estudiante o Académico.'
                    );
                }

                if (!url) {
                    throw new Error('URL de registro no definida.');
                }

                console.log(`Enviando a ${url} con payload:`, payload);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    let errorMessage = `Error HTTP: ${response.status}`;
                    try {
                        const errorData = await response.json();
                        errorMessage =
                            errorData.message ||
                            errorData.error ||
                            response.statusText;
                    } catch (jsonError) {
                        // If response is not JSON, use default error message
                        console.warn(
                            'Response was not JSON for error:',
                            response.statusText
                        );
                    }
                    throw new Error(`Error al registrar: ${errorMessage}`);
                }

                const result = await response.json();
                console.log('Registro exitoso:', result);

                alert(
                    `Registro de colaborador externo (${this.formData.userRole}) exitoso. Redirigiendo al verificador de correo.`
                );
                // REDIRECCIÓN SOLICITADA
                this.$router.push('/verify-email');
            } catch (error) {
                console.error('Error en el registro:', error);
                this.unitsError = `Error al registrar: ${error.message}`;
                alert(this.unitsError);
            } finally {
                this.loadingUnits = false;
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