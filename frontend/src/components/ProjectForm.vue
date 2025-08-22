<template>
    <div class="project-form-card">
        <!-- Saludo dinámico basado en el nombre del usuario logueado -->
        <h2 class="card-title">Bienvenido/a, {{ userName }}</h2>
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
import { useAuthStore } from '../stores/auth'; // Importa tu store
import '../assets/ProjectForm.css';

export default {
    name: 'ProjectForm',
    data() {
        const authStore = useAuthStore();
        // Obtener el nombre completo del usuario si está disponible
        const userFullName = authStore.user
            ? `${authStore.user.nombre || ''} ${authStore.user.a_paterno || ''}`.trim()
            : 'Usuario';

        return {
            userName: userFullName, // Usar este para el saludo
            academicUnits: [],
            questions: [],
            loadingQuestions: true,
            questionsError: '',
            isSubmitting: false,
            submitMessage: '',
            submitSuccess: false, // Controla la visibilidad del formulario y del botón de retorno
            project: {
                titulo: '',
                investigador: userFullName, // El investigador ahora es el nombre completo del usuario logueado
                escuela: '', // Se poblará con la unidad académica seleccionada
                respuestas: [],
            },
            URL_UA: import.meta.env.VITE_URL_UA,
            URL_PREGUNTAS: import.meta.env.VITE_URL_PREGUNTAS,
            URL_RESPUESTAS: import.meta.env.VITE_URL_RESPUESTAS,
        };
    },
    computed: {
        isFormValid() {
            // Asegúrate de que el título y la escuela (unidad académica) estén seleccionados
            return this.project.titulo.trim() !== '' && this.project.escuela.trim() !== '';
        },
    },
    async created() {
        const authStore = useAuthStore();

        // Validar que hay un usuario autenticado y su rol para mostrar el formulario
        if (!authStore.isAuthenticated || !authStore.user) {
            console.warn('ProjectForm cargado sin usuario autenticado. Redirigiendo a verificación de email.');
            this.$router.push('/verify-email');
            return;
        }

        // Si el usuario ya tiene una unidad académica asociada en su perfil, precargarla
        // Esto asume que el objeto `user` en el store tiene una propiedad `unidad`
        if (authStore.user.unidad) {
            this.project.escuela = authStore.user.unidad;
        }

        // Cargar unidades académicas y preguntas en paralelo
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
                // Opcional: Establecer un mensaje de error visible al usuario
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
                // Inicializar el array de respuestas con cadenas vacías para cada pregunta
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

            // Mapear respuestas, incluyendo un valor predeterminado si están vacías
            const finalResponses = this.project.respuestas.map((respuesta, index) => {
                const questionNumber = this.questions[index]?.numero || (index + 1);
                return respuesta && respuesta.trim() !== ''
                    ? respuesta.trim()
                    : `Pregunta ${questionNumber} sin responder`; // Puedes cambiar esto a un string vacío si el backend lo prefiere
            });

            // Preparar el payload del proyecto
            const projectPayload = {
                titulo: this.project.titulo,
                investigador: this.project.investigador, // Nombre del usuario logueado
                escuela: this.project.escuela, // Unidad académica seleccionada
                respuestas: finalResponses,
                email_autor: useAuthStore().user.email, // Añade el email del autor del store
                // Puedes añadir el ID del autor si tu backend lo necesita
                // id_autor: useAuthStore().user._id,
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
                    let errorMessage = `Error HTTP: ${response.status}`;
                    try {
                        const errorData = await response.json();
                        errorMessage =
                            errorData.message || errorData.error || response.statusText;
                    } catch (jsonError) {
                        console.warn(
                            'La respuesta de error no fue JSON:',
                            response.statusText
                        );
                    }
                    throw new Error(`Error al guardar el proyecto: ${errorMessage}`);
                }

                const result = await response.json();
                this.submitSuccess = true;
                this.submitMessage = 'Proyecto guardado con éxito!';
                console.log('Proyecto guardado:', result);
            } catch (error) {
                this.submitSuccess = false;
                this.submitMessage = error.message; // Mostrar el mensaje de error directamente
                console.error('Error al guardar el proyecto:', error);
            } finally {
                this.isSubmitting = false;
            }
        },
        goToHomePage() {
            const authStore = useAuthStore();
            authStore.clearAuthInfo(); // Limpia TODA la información de autenticación del store
            this.$router.push('/'); // Redirige a la página principal
        },
    },
};
</script>

<style scoped></style>