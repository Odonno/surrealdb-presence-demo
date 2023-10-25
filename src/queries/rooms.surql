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
    )[0].count > 0 AS is_in_room
FROM room
ORDER BY created_at;