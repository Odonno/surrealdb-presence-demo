SELECT 
    id,
    type,
    content,
    author.id,
    author.username,
    created_at
FROM message
WHERE room == $room_id
ORDER BY created_at DESC
LIMIT 3;