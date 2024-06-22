DEFINE TABLE leave_room SCHEMALESS
    PERMISSIONS 
        FOR create WHERE $auth
        FOR select, update, delete NONE;

DEFINE FIELD room_id ON leave_room TYPE record<room>;

DEFINE EVENT leave_room ON TABLE leave_room WHEN $event == "CREATE" THEN {
    LET $presence = 
        SELECT * FROM presence 
        WHERE room = $after.room_id AND user = $auth.id;

    LET $has_presence_record = count($presence) > 0;

    IF $has_presence_record THEN
    {
        UPDATE presence SET status = "left" WHERE room = $after.room_id AND user = $auth.id;
    }
    ELSE
    {
        THROW "You are not in this room";
    }
    END;

    CREATE message SET room = $after.room_id, author = $auth.id, type = "LEAVE_ROOM";
};