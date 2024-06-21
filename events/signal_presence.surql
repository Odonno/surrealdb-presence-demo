DEFINE TABLE signal_presence SCHEMALESS
    PERMISSIONS 
        FOR create WHERE $auth
        FOR select, update, delete NONE;

DEFINE FIELD room_id ON signal_presence TYPE record<room>;

DEFINE EVENT signal_presence ON TABLE signal_presence WHEN $event == "CREATE" THEN (
    UPDATE presence SET status = "joined" WHERE room = $after.room_id AND user = $auth.id
);