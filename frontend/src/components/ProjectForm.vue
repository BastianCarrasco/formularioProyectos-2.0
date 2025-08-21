<template>
    <div class="project-form-card">
        <!-- El saludo y la descripción se mantienen igual -->
        <h2 class="card-title">Bienvenido/a, {{ academicName }}</h2>
        <p class="card-description">
            Favor contestar las siguientes preguntas, de forma muy breve (que el
            documento final no sea más de 3 planas). No es obligatorio contestar
            todas las preguntas.
        </p>

        <!-- El formulario se muestra solo si NO ha habido éxito -->
        <form @submit.prevent="submitProjectForm" v-if="!submitSuccess">
            <!-- Sección de Información General del Proyecto -->
            <div class="form-section">
                <h3>Información General</h3>
                <div class="form-group">
                    <label for="projectTitle">Título del Proyecto:</label>
                    <input type="text" id="projectTitle" v-model.trim="project.titulo"
                        placeholder="Ingrese el título de su proyecto" required class="input-field" />
                </div>

                <div class="form-group">
                    <label for="unidadAcademica">Unidad Académica:</label>
                    <select id="unidadAcademica" v-model="project.escuela" required class="input-field select-field">
                        <option value="" disabled>Seleccione su unidad académica</option>
                        <option v-for="ua in academicUnits" :key="ua._id" :value="ua.nombre">
                            {{ ua.nombre }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- Sección de Cuestionario Dinámico -->
            <div class="form-section">
                <h3>Cuestionario de Propuesta</h3>
                <p v-if="loadingQuestions" class="loading-message">
                    Cargando preguntas...
                </p>
                <p v-if="questionsError" class="error-message">
                    {{ questionsError }}
                </p>
                <div v-else>
                    <div v-for="(question, index) in questions" :key="question._id" class="form-group">
                        <label :for="'question-' + index">{{ question.numero }}. {{ question.pregunta }}</label>
                        <textarea :id="'question-' + index" v-model="project.respuestas[index]" rows="4"
                            placeholder="Escriba su respuesta aquí..." class="input-field textarea-field"></textarea>
                    </div>
                </div>
            </div>

            <div class="button-group">
                <button type="submit" class="btn-primary" :disabled="!isFormValid || isSubmitting">
                    {{ isSubmitting ? 'Enviando...' : 'Guardar Proyecto' }}
                </button>
            </div>
        </form>

        <!-- Mensaje de éxito/error y el botón de volver al inicio -->
        <p v-if="submitMessage" :class="{ 'success-message': submitSuccess, 'error-message': !submitSuccess }">
            {{ submitMessage }}
        </p>

        <div v-if="submitSuccess" class="button-group success-action-group">
            <button @click="goToHomePage" class="btn-secondary">
                Volver a la Página Principal
            </button>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from '../stores/auth';
import '../assets/ProjectForm.css';

export default {
    name: 'ProjectForm',
    data() {
        const authStore = useAuthStore();
        const academicNameFromStore = authStore.academicFullName || 'Académico';
        const investigatorFullNameFromStore = authStore.academicFullName || '';

        return {
            academicName: academicNameFromStore,
            academicEmail: authStore.academicEmail || '',
            academicUnits: [],
            questions: [],
            loadingQuestions: true,
            questionsError: '',
            isSubmitting: false,
            submitMessage: '',
            submitSuccess: false, // Controla la visibilidad del formulario y del botón de retorno
            project: {
                titulo: '',
                investigador: investigatorFullNameFromStore,
                escuela: '',
                respuestas: [],
            },
            URL_UA: import.meta.env.VITE_URL_UA,
            URL_PREGUNTAS: import.meta.env.VITE_URL_PREGUNTAS,
            URL_RESPUESTAS: import.meta.env.VITE_URL_RESPUESTAS,
        };
    },
    computed: {
        isFormValid() {
            return this.project.titulo && this.project.escuela;
        },
    },
    async created() {
        const authStore = useAuthStore();
        if (!authStore.academicFullName || !authStore.academicEmail) {
            console.warn('ProjectForm cargado sin información de académico en el store. Redirigiendo a verificación de email.');
            this.$router.push('/verify-email');
            return;
        }
        await Promise.all([this.fetchAcademicUnits(), this.fetchQuestions()]);
    },
    methods: {
        async fetchAcademicUnits() {
            try {
                const response = await fetch(this.URL_UA);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.academicUnits = await response.json();
            } catch (error) {
                console.error('Error al cargar unidades académicas:', error);
            }
        },
        async fetchQuestions() {
            this.loadingQuestions = true;
            this.questionsError = '';
            try {
                const response = await fetch(this.URL_PREGUNTAS);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                this.questions = data.sort((a, b) => a.numero - b.numero);
                this.project.respuestas = Array(this.questions.length).fill('');
            } catch (error) {
                console.error('Error al cargar preguntas:', error);
                this.questionsError =
                    'No se pudieron cargar las preguntas del cuestionario.';
            } finally {
                this.loadingQuestions = false;
            }
        },
        async submitProjectForm() {
            this.isSubmitting = true;
            this.submitMessage = '';
            this.submitSuccess = false;

            const finalResponses = this.project.respuestas.map((respuesta, index) => {
                const questionNumber = this.questions[index]?.numero || (index + 1);

                return respuesta && respuesta.trim() !== ''
                    ? respuesta.trim()
                    : `Pregunta ${questionNumber} sin responder`;
            });

            const projectPayload = {
                ...this.project,
                respuestas: finalResponses,
            };

            console.log('ProjectForm: Datos POST a enviar:', JSON.stringify(projectPayload, null, 2));

            try {
                const response = await fetch(this.URL_RESPUESTAS, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(projectPayload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error del backend (status ' + response.status + '):', errorData);
                    throw new Error(
                        errorData.message || errorData.error || `HTTP error! status: ${response.status}`
                    );
                }

                const result = await response.json();
                this.submitSuccess = true; // Establece el éxito
                this.submitMessage = 'Proyecto guardado con éxito!';
                console.log('Proyecto guardado:', result);

                // Ya no limpiar el formulario ni redirigir aquí, el botón lo hará
            } catch (error) {
                this.submitSuccess = false;
                this.submitMessage = `Error al guardar el proyecto: ${error.message}`;
                console.error('Error al guardar el proyecto:', error);
            } finally {
                this.isSubmitting = false;
            }
        },
        goToHomePage() {
            const authStore = useAuthStore();
            authStore.clearAcademicInfo(); // Limpia la información del académico al volver
            this.$router.push('/'); // Redirige a la página principal
        },
    },
};
</script>

<style scoped></style>