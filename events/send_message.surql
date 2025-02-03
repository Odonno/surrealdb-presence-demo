DEFINE TABLE OVERWRITE send_message SCHEMALESS
    PERMISSIONS 
        FOR create WHERE $auth
        FOR select, update, delete NONE;

DEFINE FIELD OVERWRITE room_id ON join_room TYPE record<room>;
DEFINE FIELD OVERWRITE content ON send_message TYPE string;

DEFINE EVENT OVERWRITE send_message ON TABLE send_message WHEN $event == "CREATE" THEN {
    CREATE message
    SET 
        room = $after.room_id, 
        author = $auth.id, 
        type = "TEXT_MESSAGE", 
        content = $after.content;
};