document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('img-modal');
  const modalImg = document.getElementById('modal-img');
  const closeModal = document.getElementById('close-modal');

  document.querySelectorAll('.zoomable').forEach(img => {
    img.addEventListener('click', () => {
      modal.style.display = 'flex';
      modalImg.src = img.src;

      modalImg.style.animation = 'none';
      void modalImg.offsetWidth;
      modalImg.style.animation = 'zoomIn 0.3s ease forwards';
    });
  });

  closeModal?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal?.addEventListener('click', (e) => {
    if (e.target.id === 'img-modal') {
      modal.style.display = 'none';
    }
  });
});
