SELECT
    id,
    name,
    created_at,
    (
        SELECT count()
        FROM presence 
        WHERE room = $parent.id 
        AND user = $auth.id 
        AND status = "joined"
        GROUP ALL
    )[0].count > 0 AS is_in_room,
    (
        SELECT count(user)
        FROM presence
        WHERE room = $parent.id
        AND status = "joined"
        AND time::now() - updated_at < 5m
        GROUP ALL
    )[0].count || 0 AS number_of_active_users
FROM room
ORDER BY created_at;