const gallery = document.querySelector('#team-gallery');

if (gallery) {
  const track = gallery.querySelector('.team-gallery-track');
  const photos = track.querySelector('ul');
  const repeat = photos.cloneNode(true);
  repeat.setAttribute('aria-hidden', 'true');
  repeat.querySelectorAll('img').forEach((image) => image.alt = '');
  track.append(repeat);
  // Load the entire loop before its initially offscreen photos move into view.
  track.querySelectorAll('img').forEach((image) => image.loading = 'eager');
  gallery.classList.add('is-animated');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      gallery.classList.toggle('is-visible', entry.isIntersecting);
    });
    observer.observe(gallery);
  } else {
    gallery.classList.add('is-visible');
  }
}
