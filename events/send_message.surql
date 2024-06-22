DEFINE TABLE send_message SCHEMALESS
    PERMISSIONS 
        FOR create WHERE $auth
        FOR select, update, delete NONE;

DEFINE FIELD room_id ON join_room TYPE record<room>;
DEFINE FIELD content ON send_message TYPE string;

DEFINE EVENT send_message ON TABLE send_message WHEN $event == "CREATE" THEN {
    CREATE message
    SET 
        room = $after.room_id, 
        author = $auth.id, 
        type = "TEXT_MESSAGE", 
        content = $after.content;
};