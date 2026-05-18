document.querySelectorAll('.reviews-marquee').forEach(function(marquee) {
  marquee.querySelectorAll('.reviews-marquee__track').forEach(function(track) {
    track.innerHTML += track.innerHTML;
    var items = track.children;
    var half = items.length / 2;
    for (var i = half; i < items.length; i++) items[i].setAttribute('aria-hidden', 'true');
  });
  var btn = marquee.querySelector('.reviews-marquee__pause');
  var label = btn && btn.querySelector('.reviews-marquee__pause-label');
  var icon = btn && btn.querySelector('.reviews-marquee__pause-icon');
  btn && btn.addEventListener('click', function() {
    var paused = marquee.classList.toggle('is-paused');
    btn.setAttribute('aria-pressed', String(paused));
    if (label) label.textContent = paused ? 'Abspielen' : 'Pausieren';
    if (icon) icon.textContent = paused ? '▶' : '⏸';
  });
});
