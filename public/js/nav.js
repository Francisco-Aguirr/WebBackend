document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navList = document.querySelector(".navbar-list");

  hamburger.addEventListener("click", (e) => {
    e.preventDefault();
    
    // Alternar clases
    hamburger.classList.toggle("active");
    navList.classList.toggle("show");
    
    // Actualizar atributos ARIA
    const isExpanded = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", !isExpanded);
  });

  // Cerrar menú al hacer click en un enlace (solo móvil)
  navList.querySelectorAll(".navbar-link").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        hamburger.classList.remove("active");
        navList.classList.remove("show");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  });

  // Asegurar que el menú se cierre al cambiar a vista desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      hamburger.classList.remove("active");
      navList.classList.remove("show");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
});