DEFINE TABLE last_presence AS
	SELECT
        user,
        time::max(updated_at) AS at
    FROM presence
	GROUP BY user
PERMISSIONS 
    FOR select FULL
    FOR create, update, delete NONE;