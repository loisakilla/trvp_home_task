import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import DB from './db/client.js';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: './backend/.env'
});

const appHost = process.env.APP_HOST;
const appPort = process.env.APP_PORT;

const app = express();
const db = new DB();

// Настройка сессии
app.use(session({
    secret: 'секретный ключ',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use('*', (req, res, next) => {
    console.log(req.method, req.baseUrl || req.url, new Date().toISOString());
    next();
});

app.use(express.json()); // Промежуточный обработчик для разбора JSON

app.post('/login', async (req, res) => {
    const { login, password } = req.body;
    try {
        const user = await db.check(login, password);
        if (user.rows.length > 0) {
            // Сохранение ID пользователя в сессию
            req.session.userId = user.rows[0].id;
            res.json({ success: true, message: 'Аутентификация прошла успешно' });
        } else {
            res.status(401).json({ success: false, message: 'Неверные учетные данные' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

function generateUUID() {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

app.post('/register', async (req, res) => {
    const { login, password, firstName, lastName, phone, email, city } = req.body;
    const userId = generateUUID(); // Генерация уникального ID для пользователя

    try {
        const queryText = `INSERT INTO public."Users" (id, login, password, "First_name", "Second_name", "Phone", "Email", "City", "Path_Avatar")
                           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'frontend/public/images/default-avatar');`;
        const queryParams = [userId, login, password, firstName, lastName, phone, email, city];
        await db.query(queryText, queryParams);
        res.json({ success: true, message: 'Пользователь успешно зарегистрирован' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка при регистрации пользователя' });
    }
});

app.use('/', express.static(path.resolve(__dirname, '../dist')));

app.get('/materials', async (req, res) => {
    try {
        const result = await db.query('SELECT name FROM public."Materials"');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка при получении списка материалов' });
    }
});

// Маршрут для получения списка изделий
app.get('/items', async (req, res) => {
    try {
        const result = await db.query('SELECT DISTINCT name FROM public."Creations"');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка при получении списка изделий' });
    }
});

// Добавляем новый маршрут для получения данных пользователя
app.get('/profile', async (req, res) => {
    try {
        const userId = req.session.userId;
        const queryText = 'SELECT "First_name", "Second_name", "Phone", "Email", "City" FROM public."Users" WHERE id = $1;';
        const user = await db.query(queryText, [userId]);
        res.json(user.rows[0]);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.post('/change-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Необходима аутентификация' });
    }

    try {
        // Сначала проверяем старый пароль
        const checkResult = await db.checkPassword(userId, oldPassword);
        if (checkResult.rowCount === 0) {
            return res.status(401).json({ success: false, message: 'Неверный старый пароль' });
        }

        // Обновляем пароль
        await db.updatePassword(userId, newPassword);
        res.json({ success: true, message: 'Пароль успешно изменен' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.get('/materials-from-creation', async (req, res) => {
    const creationName = req.query.creationName;
    try {
        const query = `SELECT M.id, M.name as material_name, C.price as creation_price, C.name as creation_name
                       FROM public."Creations" AS C
                       JOIN public."Materials" AS M ON C.material_id = M.id
                       WHERE C.name = $1;`;
        const result = await db.query(query, [creationName]);
        console.log('Результаты SQL-запроса:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при выполнении SQL-запроса:', error);
        res.status(500).json({ success: false, message: 'Ошибка при получении данных' });
    }
});

app.get('/creation-from-material', async (req, res) => {
    const { materialName, creationName } = req.query;
    try {
        const query = `SELECT C.id, C.name, C.price, M.name as material_name
                       FROM public."Creations" AS C
                       JOIN public."Materials" AS M ON C.material_id = M.id
                       WHERE M.name = $1 and C.name = $2;`;
        const result = await db.query(query, [materialName, creationName]);
        console.log('Результаты SQL-запроса:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при выполнении SQL-запроса:', error);
        res.status(500).json({ success: false, message: 'Ошибка при получении данных' });
    }
});

app.get('/creations-from-material', async (req, res) => {
    const materialName = req.query.materialName;
    try {
        const query = `SELECT C.id, C.name, C.price, M.name as material_name
                       FROM public."Creations" AS C
                       JOIN public."Materials" AS M ON C.material_id = M.id
                       WHERE M.name = $1;`;
        const result = await db.query(query, [materialName]);
        console.log('Результаты SQL-запроса:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при выполнении SQL-запроса:', error);
        res.status(500).json({ success: false, message: 'Ошибка при получении данных' });
    }
});


const server = app.listen(Number(appPort), appHost, async () => {
    try {
        await db.connect();
    } catch (error) {
        console.log('App shut down');
        process.exit(100);
    }
    console.log(`App started at host http://${appHost}:${appPort}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
        await db.disconnect();
        console.log('HTTP server closed');
    });
});



