// JS-файл обработки страницы аутентификации
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login: username, password }),
    });

    const data = await response.json();

    if (data.success) {
        window.location.href = 'templates/start.html';
    } else {
        alert('Ошибка аутентификации');
    }
});

// Получаем модальное окно
var modal = document.getElementById("registration-modal");

// Получаем кнопку, которая открывает модальное окно
var btn = document.getElementById("registration-button");

// Получаем элемент <span>, который закрывает модальное окно
var span = document.getElementsByClassName("close-button")[0];

// При нажатии на кнопку открываем модальное окно
btn.onclick = function() {
    modal.style.display = "block";
}

// При нажатии на <span> (x), закрываем модальное окно
span.onclick = function() {
    modal.style.display = "none";
}

// При нажатии вне модального окна, оно закрывается
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Добавляем обработчик событий для формы регистрации
document.getElementById('registration-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const userData = {
        login: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        firstName: document.getElementById('reg-firstname').value,
        lastName: document.getElementById('reg-lastname').value,
        phone: document.getElementById('reg-phone').value,
        email: document.getElementById('reg-email').value,
        city: document.getElementById('reg-city').value,
    };

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (data.success) {
            alert('Регистрация прошла успешно');
            modal.style.display = "none"; // Закрыть модальное окно после регистрации
        } else {
            alert('Ошибка регистрации');
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
    }
});


