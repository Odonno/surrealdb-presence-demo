SELECT
    username,
    avatar
FROM user
WHERE id = $auth.id;