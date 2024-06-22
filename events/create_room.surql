DEFINE TABLE create_room SCHEMALESS
    PERMISSIONS 
        FOR create WHERE $auth
        FOR select, update, delete NONE;

DEFINE EVENT create_room ON TABLE create_room WHEN $event == "CREATE" THEN {
    LET $rooms = (
        SELECT * 
        FROM room 
        WHERE owner == $auth.id
    );

    LET $is_room_already_created = count($rooms) > 0;

    IF $is_room_already_created THEN
    {
        THROW "You cannot create more than one room.";
    }
    ELSE
    {
        LET $room_name = "@" + $auth.username + "'s room";
        LET $new_rooms = CREATE room SET name = $room_name, owner = $auth.id;
        LET $own_room = $new_rooms[0];
        CREATE presence SET room = $own_room.id, user = $auth.id;
        CREATE message SET room = $own_room.id, author = $auth.id, type = "ENTER_ROOM";
    }
    END;
};