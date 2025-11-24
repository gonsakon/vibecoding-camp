// 漢堡選單
const hamburger = document.querySelector('.hamburger');
const navList = document.querySelector('.nav-list');

hamburger.addEventListener('click', () => {
  navList.classList.toggle('active');
  hamburger.classList.toggle('active');
});

// 平滑滾動
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // 手機版關閉選單
      if (navList.classList.contains('active')) {
        navList.classList.remove('active');
        hamburger.classList.remove('active');
      }
    }
  });
});