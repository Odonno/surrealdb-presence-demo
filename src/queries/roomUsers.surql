SELECT
    user.id AS user_id,
    user.username AS username,
    user.avatar AS avatar,
    string::uppercase(string::slice(user.username, 0, 2)) AS avatarFallback,
    status,
    updated_at,
    user.registered_at AS registered_at
FROM presence
WHERE room = $room_id;