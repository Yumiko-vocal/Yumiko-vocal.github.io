document.addEventListener('DOMContentLoaded', () => {
  // モーダル要素を取得
  const modal = document.getElementById('img-modal');
  const modalImg = document.getElementById('modal-img');
  const closeModal = document.getElementById('close-modal');

  // 【重要】イベントデリゲーションで .zoomable に対応
  // ページ全体（body）でクリックイベントを監視しておく
  document.body.addEventListener('click', (e) => {
    // クリックされた要素またはその親に .zoomable クラスがあれば取得
    const img = e.target.closest('.zoomable');
    if (img) {
      // モーダルを表示
      modal.style.display = 'flex';

      // クリックされた画像の src をモーダル画像に反映
      modalImg.src = img.src;

      // アニメーションのリセット（連続クリックでも発動させるため）
      modalImg.style.animation = 'none';
      void modalImg.offsetWidth; // ←これでブラウザに「変更」を認識させる
      modalImg.style.animation = 'zoomIn 0.3s ease forwards';
    }
  });

  // ×ボタンをクリックしたらモーダルを閉じる
  closeModal?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // モーダル背景部分をクリックした場合も閉じる
  modal?.addEventListener('click', (e) => {
    if (e.target.id === 'img-modal') {
      modal.style.display = 'none';
    }
  });
});
