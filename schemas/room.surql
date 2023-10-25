DEFINE TABLE room SCHEMAFULL
    PERMISSIONS
        FOR select FULL
        FOR create, update, delete NONE;

DEFINE FIELD name ON room TYPE string;
DEFINE FIELD created_at ON room TYPE datetime DEFAULT time::now();