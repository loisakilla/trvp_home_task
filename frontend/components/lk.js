window.updateAvatar = function(input) {
    alert('Функция смены аватара еще не реализована.');
}

window.changePassword = async function() {
    const oldPassword = prompt('Введите старый пароль');
    const newPassword = prompt('Введите новый пароль');

    try {
        const response = await fetch('/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ oldPassword, newPassword }),
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Ошибка при смене пароля:', error);
    }
};


// Функция для загрузки и отображения данных пользователя
async function loadUserProfile() {
    try {
        const response = await fetch('/profile');
        if (!response.ok) {
            throw new Error('Ошибка запроса данных профиля');
        }
        const userData = await response.json();

        document.getElementById('user-first-name').textContent = userData.First_name;
        document.getElementById('user-last-name').textContent = userData.Second_name;
        document.getElementById('user-phone').textContent = userData.Phone;
        document.getElementById('user-email').textContent = userData.Email;
        document.getElementById('user-city').textContent = userData.City;

    } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', loadUserProfile);
