DEFINE TABLE leave_room SCHEMALESS;

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
};