import { createApp } from "vue";
import { createPinia } from "pinia"; // <-- Importa createPinia
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";

const app = createApp(App);
const pinia = createPinia(); // <-- Crea la instancia de Pinia

app.use(router);
app.use(pinia); // <-- Usa Pinia en tu aplicación

app.mount("#app");
