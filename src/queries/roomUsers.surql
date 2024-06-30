SELECT
    at AS last_presence,
    user.id AS user_id,
    user.username AS username,
    user.avatar AS avatar,
    string::uppercase(string::slice(user.username, 0, 2)) AS avatarFallback,
    user.registered_at AS registered_at
FROM last_presence
WHERE user IN $room_id.users
ORDER BY last_presence DESC
LIMIT 12;