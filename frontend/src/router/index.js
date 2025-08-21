import { createRouter, createWebHistory } from "vue-router";
import AccessVerification from "../components/AccessVerification.vue";
import EmailVerification from "../components/EmailVerification.vue";
import ProjectForm from "../components/ProjectForm.vue";
import ExternalRegistrationForm from "../components/ExternalRegistrationForm.vue";

const routes = [
  {
    path: "/",
    name: "AccessVerification",
    component: AccessVerification,
  },
  {
    path: "/verify-email",
    name: "EmailVerification",
    component: EmailVerification,
    // REMOVIDO: Ya no necesitamos pasar academicInfo como prop
    // props: (route) => ({ academicInfo: route.params.academicInfo }),
  },
  {
    path: "/project-form",
    name: "ProjectForm",
    component: ProjectForm,
    // REMOVIDO: Ya no necesitamos pasar academicInfo como prop
    // props: (route) => ({ academicInfo: route.params.academicInfo }),
  },
  {
    path: "/external-registration",
    name: "ExternalRegistration",
    component: ExternalRegistrationForm,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
