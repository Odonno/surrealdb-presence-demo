DEFINE TABLE message SCHEMAFULL
    PERMISSIONS
        FOR select FULL
        FOR create WHERE user == $auth.id
        FOR update, delete NONE;

DEFINE FIELD room ON message TYPE record<room>;
DEFINE FIELD author ON message TYPE option<record<user>>;
DEFINE FIELD content ON message TYPE option<string>;
DEFINE FIELD type ON message TYPE string ASSERT $value IN ["ENTER_ROOM", "LEAVE_ROOM"];
DEFINE FIELD created_at ON message TYPE datetime DEFAULT time::now();