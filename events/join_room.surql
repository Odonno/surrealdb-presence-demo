DEFINE TABLE join_room SCHEMALESS;

DEFINE FIELD room_id ON join_room TYPE record<room>;

DEFINE EVENT join_room ON TABLE join_room WHEN $event == "CREATE" THEN {
    LET $presence = 
        SELECT * FROM presence 
        WHERE room = $after.room_id AND user = $auth.id;

    LET $has_presence_record = count($presence) > 0;

    IF $has_presence_record THEN
    {
        UPDATE presence SET status = "joined" WHERE room = $after.room_id AND user = $auth.id;
    }
    ELSE
    {
        CREATE presence SET room = $after.room_id, user = $auth.id;
    }
    END;
};