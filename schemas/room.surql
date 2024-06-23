DEFINE TABLE room SCHEMAFULL
    PERMISSIONS
        FOR select FULL
        FOR create, update, delete NONE;

DEFINE FIELD name ON room TYPE string;
DEFINE FIELD owner ON room TYPE option<record<user>>;
DEFINE FIELD users ON room TYPE set<record<user>> DEFAULT [];
DEFINE FIELD created_at ON room TYPE datetime DEFAULT time::now();

DEFINE INDEX unique_name ON room COLUMNS name UNIQUE;