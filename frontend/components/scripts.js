document.addEventListener('DOMContentLoaded', function() {
    const materialsDropdown = document.getElementById('materials-dropdown');
    const itemsDropdown = document.getElementById('items-dropdown');
    const searchBtn = document.getElementById('search-btn');
    const container = document.querySelector('.container');

    // Функция для заполнения выпадающих списков

    function populateDropdown(dropdown, options) {
        // Создаем и добавляем пустую опцию в начало списка
        const defaultOption = document.createElement('option');
        defaultOption.value = '—';
        defaultOption.textContent = '—'; // Или любой другой текст по умолчанию
        dropdown.appendChild(defaultOption);

        // Добавляем остальные опции, полученные из базы данных
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option;
            optElement.textContent = option;
            dropdown.appendChild(optElement);
        });
    }

    // Функция для получения данных с сервера и обновления выпадающего списка
    async function updateDropdown(dropdown, url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            populateDropdown(dropdown, data.map(item => item.name));
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
        }
    }

    // Получение и обновление данных для выпадающих списков при загрузке страницы
    updateDropdown(materialsDropdown, '/materials');
    updateDropdown(itemsDropdown, '/items');
    // Функция для создания содержимого результатов поиска
    async function performSearch(material, creation) {
        let url;
        if (material !== '—' && creation !== '—') {
            url = `/creation-from-material?materialName=${encodeURIComponent(material)}&creationName=${encodeURIComponent(creation)}`;
        } else if (material !== '—') {
            url = `/creations-from-material?materialName=${encodeURIComponent(material)}`;
        } else if (creation !== '—') {
            url = `/materials-from-creation?creationName=${encodeURIComponent(creation)}`;
        } else {
            return null;
        }

        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Ошибка при выполнении поиска:', error);
            return null;
        }
    }

// Обновленный обработчик нажатия на кнопку поиска
    searchBtn.addEventListener('click', async function() {
        const selectedMaterial = materialsDropdown.value;
        const selectedItem = itemsDropdown.value;

        // Выполнение поиска
        const searchResults = await performSearch(selectedMaterial, selectedItem);

        if (!searchResults || searchResults.length === 0) {
            alert('Пожалуйста, выберите материал или изделие для поиска.');
            return;
        }

        // Очистка контейнера и добавление таблицы с результатами
        container.innerHTML = '';
        const resultsHeading = document.createElement('h1');
        resultsHeading.textContent = 'Результаты Поиска';
        container.appendChild(resultsHeading);

        // Создание таблицы
        const resultsTable = document.createElement('table');

        // Создание и добавление заголовков таблицы
        const thead = resultsTable.createTHead();
        const headerRow = thead.insertRow();

        // Получаем названия столбцов из ключей первого элемента результатов
        const columns = Object.keys(searchResults[0]);
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.replace('_', ' ').toUpperCase(); // Заменяем подчеркивания и делаем текст заглавными буквами
            headerRow.appendChild(th);
        });

        // Создание тела таблицы и добавление данных
        const tbody = resultsTable.createTBody();
        searchResults.forEach(item => {
            const row = tbody.insertRow();
            columns.forEach(col => {
                const cell = row.insertCell();
                cell.textContent = item[col] || 'Не указан';
            });
        });

        container.appendChild(resultsTable);

        // Кнопка возврата
        const backButton = document.createElement('button');
        backButton.textContent = 'Вернуться обратно';
        backButton.classList.add('back-button');
        backButton.addEventListener('click', function() {
            window.location.reload();
        });
        container.appendChild(backButton);
    });

});
