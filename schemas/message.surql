DEFINE TABLE OVERWRITE message SCHEMAFULL
    PERMISSIONS
        FOR select FULL
        FOR create WHERE user == $auth.id
        FOR update, delete NONE;

DEFINE FIELD OVERWRITE room ON message TYPE record<room>;
DEFINE FIELD OVERWRITE author ON message TYPE option<record<user>>;
DEFINE FIELD OVERWRITE content ON message TYPE option<string>;
DEFINE FIELD OVERWRITE type ON message TYPE string ASSERT $value IN ["ENTER_ROOM", "LEAVE_ROOM", "TEXT_MESSAGE"];
DEFINE FIELD OVERWRITE created_at ON message TYPE datetime DEFAULT time::now();