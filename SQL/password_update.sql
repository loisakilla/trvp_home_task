UPDATE public."Users"
SET password = 'новый_пароль'
WHERE id = 'id_пользователя' AND password = 'текущий_пароль';
