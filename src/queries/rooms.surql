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
    ) AS number_of_active_users
FROM room
ORDER BY created_at;