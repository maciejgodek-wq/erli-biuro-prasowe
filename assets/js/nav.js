(function() {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', function() {
    var isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Zamknij menu' : 'Otwórz menu');
  });

  menu.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Otwórz menu');
    });
  });

  document.addEventListener('click', function(e) {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Otwórz menu');
    }
  });
})();
