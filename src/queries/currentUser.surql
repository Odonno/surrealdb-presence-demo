SELECT
    id,
    username,
    avatar,
    string::uppercase(string::slice(username, 0, 2)) AS avatarFallback
FROM user
WHERE id = $auth.id;