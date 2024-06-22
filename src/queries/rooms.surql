SELECT
    id,
    name,
    created_at,
    array::len(
        SELECT *
        FROM presence 
        WHERE room = $parent.id 
        AND user = $auth.id
        AND status = "joined"
    ) > 0 AS is_in_room,
    array::len(
        SELECT count(user)
        FROM presence
        WHERE room = $parent.id
        AND status = "joined"
        AND time::now() - updated_at < 5m
        GROUP ALL
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