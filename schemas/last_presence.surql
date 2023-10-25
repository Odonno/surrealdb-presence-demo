DEFINE TABLE last_presence AS
	SELECT
        user,
        room,
        time::max(updated_at) AS at
    FROM presence
    WHERE status = "joined"
	GROUP BY user, room
;