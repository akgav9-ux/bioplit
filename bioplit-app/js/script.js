// ============================================
// ===== БУРГЕР-МЕНЮ (открытие/закрытие) =====
// ============================================

document.addEventListener('DOMContentLoaded', function() {

    const burgerBtn = document.getElementById('burgerBtn');
    const mainNav = document.getElementById('mainNav');

    // Если элементы найдены
    if (burgerBtn && mainNav) {

        // Клик по бургеру
        burgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mainNav.classList.toggle('active');
        });

        // Закрываем меню при клике на любую ссылку в меню
        document.querySelectorAll('.nav a').forEach(function(link) {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
            });
        });

        // Закрываем меню при клике вне шапки
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.header')) {
                mainNav.classList.remove('active');
            }
        });

    }

    // ============================================
    // ===== КНОПКА "ЗАКАЗАТЬ ЗВОНОК" ============
    // ============================================

    const callbackBtn = document.getElementById('callbackBtn');

    if (callbackBtn) {
        callbackBtn.addEventListener('click', function() {
            alert('📞 Форма обратной связи будет здесь.\nСкоро добавим модальное окно!');
        });
    }

    // ============================================
    // ===== ПОДСВЕТКА АКТИВНОЙ СТРАНИЦЫ =========
    // ============================================

    // Находим текущий URL страницы
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Проходим по всем ссылкам в меню
    document.querySelectorAll('.nav a').forEach(function(link) {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        }
    });

});
