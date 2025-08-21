<template>
  <div class="page-container">
    <!-- Header Section (global) -->
    <header class="header">
      <div class="header-content">
        <div class="header-logos">
          <!-- Usando logo-fin.png para Facultad de Ingeniería (por su nombre "logo-fin") -->
          <img :src="logoFacultadIngenieria" alt="Facultad de Ingeniería Logo" class="faculty-logo" />
          <!-- Usando Escudo-PUCV.svg para la Universidad -->
          <!-- <img :src="escudoPUCV" alt="Pontificia Universidad Católica de Valparaíso Logo" class="pucv-logo" /> -->
        </div>
        <h1 class="header-title">Perfil de Proyecto Innovación Tecnológica</h1>
      </div>
    </header>

    <!-- Main Content Section - This is where different views will be rendered -->
    <main class="main-content">
      <router-view></router-view>
    </main>

    <!-- Footer Section (global) -->
    <footer class="footer">
      <div class="footer-upper">
        <!-- Usando Escudo-PUCV.svg de nuevo para el footer -->
        <img :src="escudoPUCV" alt="Pontificia Universidad Católica de Valparaíso Logo" class="footer-pucv-logo" />
        <!-- Los nombres son bastante claros -->
        <img :src="acreditacion7Anios" alt="7 Años de Acreditación" class="acreditacion-logo" />
        <img :src="cnaLogo" alt="CNA Chile Logo" class="cna-logo" />
        <img :src="g9Logo" alt="G9 Universidades Logo" class="g9-logo" />
      </div>
      <div class="footer-lower">
        <p>© 2025 Pontificia Universidad Católica de Valparaíso</p>
        <p>Dirección: Av. Brasil 2950, Valparaíso, Chile</p>
        <p>Contacto: decanato.ingenieria@pucv.cl</p>
      </div>
    </footer>
  </div>
</template>

<script>
// Importa los archivos de imagen desde src/icons/
import logoFacultadIngenieria from './icons/logo-fin.png'; // Asumiendo que logo-fin.png es el de la Facultad de Ingeniería
import escudoPUCV from './icons/Escudo-PUCV.svg';
import acreditacion7Anios from './icons/AC.svg'; // Asumiendo que AC.svg es el de 7 Años de Acreditación
import cnaLogo from './icons/CNA.svg';
import g9Logo from './icons/LOGO_G9.svg';
import '../src/assets/app.css'; // Importa los estilos globales

export default {
  name: 'App',
  data() {
    return {
      logoFacultadIngenieria,
      escudoPUCV,
      acreditacion7Anios,
      cnaLogo,
      g9Logo,
    };
  },
  // Ya no necesitamos methods() aquí a menos que App.vue necesite su propia lógica
};
</script>
