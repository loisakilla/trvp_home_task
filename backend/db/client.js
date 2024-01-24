import pg from 'pg';

export default class DB {
  #dbClient = null;
  #dbHost = '';
  #dbPort = '';
  #dbName = '';
  #dbLogin = '';
  #dbPassword = '';

  constructor() {
      this.#dbHost = process.env.DB_HOST;
      this.#dbPort = process.env.DB_PORT;
      this.#dbName = process.env.DB_NAME;
      this.#dbLogin = process.env.DB_LOGIN;
      this. #dbPassword = process.env.DB_PASSWORD;

      this.#dbClient = new pg.Client({
          user: this.#dbLogin,
          password: this.#dbPassword,
          host: this.#dbHost,
          port: this.#dbPort,
          database: this.#dbName
      });
  }

  async connect () {
      try{
          await this.#dbClient.connect();
          console.log('DB connection sucsessful')
      } catch (error){
          console.error('Unable to connect to the DB:', error);
          return Promise.reject(error);
      }
  }

  async disconnect(){
    await this.#dbClient.end();
    console.log('DB connection closed')
  }

  async check(login, password) {
      try {
          const queryText = 'SELECT id, login FROM public."Users" WHERE login = $1 AND password = $2;';
          const queryParams = [login, password];
          const result = await this.#dbClient.query(queryText, queryParams);
          return result; // Возвращаем результат запроса
      } catch (error) {
          console.error('Ошибка при проверке пользователя:', error);
          throw error; // Выбрасываем ошибку для последующей обработки
      }
  }

    async query(queryText, queryParams) {
        try {
            const result = await this.#dbClient.query(queryText, queryParams);
            return result; // Возвращаем результат запроса
        } catch (error) {
            console.error('Ошибка при выполнении запроса к БД:', error);
            throw error;
        }
    }

    async checkPassword(userId, password) {
        try {
            const queryText = 'SELECT id FROM public."Users" WHERE id = $1 AND password = $2;';
            const queryParams = [userId, password];
            const result = await this.#dbClient.query(queryText, queryParams);
            return result; // Возвращаем результат запроса (rowCount для проверки совпадения)
        } catch (error) {
            console.error('Ошибка при проверке пароля:', error);
            throw error;
        }
    }

    async updatePassword(userId, newPassword) {
        try {
            const queryText = 'UPDATE public."Users" SET password = $2 WHERE id = $1;';
            const queryParams = [userId, newPassword];
            await this.#dbClient.query(queryText, queryParams);
            // Здесь не возвращаем результат, так как это операция обновления
        } catch (error) {
            console.error('Ошибка при обновлении пароля:', error);
            throw error;
        }
    }

};