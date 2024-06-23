SELECT VALUE (
    SELECT 
        id AS user_id,
        username,
        avatar,
        string::uppercase(string::slice(username, 0, 2)) AS avatarFallback,
        (
            SELECT VALUE at
            FROM last_presence
            WHERE user == $auth.id
        )[0] AS last_presence,
        registered_at
    FROM $parent.users
)
FROM ONLY $room_id;