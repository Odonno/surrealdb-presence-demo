DEFINE TABLE signal_presence SCHEMALESS
    PERMISSIONS 
        FOR create WHERE $auth
        FOR select, update, delete NONE;

DEFINE EVENT signal_presence ON TABLE signal_presence WHEN $event == "CREATE" THEN (
    CREATE presence SET user = $auth.id
);