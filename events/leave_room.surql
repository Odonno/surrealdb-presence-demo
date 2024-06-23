DEFINE TABLE leave_room SCHEMALESS
    PERMISSIONS 
        FOR create WHERE $auth
        FOR select, update, delete NONE;

DEFINE FIELD room_id ON leave_room TYPE record<room>;

DEFINE EVENT leave_room ON TABLE leave_room WHEN $event == "CREATE" THEN {
    LET $users = SELECT VALUE users FROM ONLY $after.room_id;
    LET $is_in_room = RETURN $auth.id IN $users;

    IF $is_in_room THEN
    {
        UPDATE $after.room_id SET users -= [$auth.id];
        CREATE presence SET user = $auth.id;
        CREATE message SET room = $after.room_id, author = $auth.id, type = "LEAVE_ROOM";
    }
    ELSE
    {
        THROW "You are not in this room";
    }
    END;
};