LIVE SELECT
    user.id AS user_id,
    user.username AS username,
    user.avatar AS avatar,
    status,
    updated_at
FROM presence
WHERE room = $room_id;