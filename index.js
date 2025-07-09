// Mobile menu functionality
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('translate-x-full');
}
function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.add('translate-x-full');
}
function goToHomepage() {
  window.location.hash = '';
  showTab('hero');
  window.scrollTo(0, 0);
}
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
    }
  });
}, observerOptions);
document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});
// ... (rest of the JS from the <script> block, unchanged) ... 