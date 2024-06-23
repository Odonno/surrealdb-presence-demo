SELECT
    id,
    name,
    created_at,
    (
        RETURN $auth.id IN $parent.users
    ) AS is_in_room,
    array::len(
        SELECT count()
        FROM $parent.users
        WHERE time::now() - (
            SELECT VALUE at
            FROM last_presence
            WHERE user == $parent.id
        )[0] < 5m
    ) AS number_of_active_users,
    owner.id != $auth.id AS can_leave,
    (
        SELECT 
            id,
            type,
            content,
            author.id,
            author.username,
            created_at
        FROM message
        WHERE room = $parent.id
        ORDER BY created_at DESC
    ) AS messages
FROM room
ORDER BY created_at DESC;