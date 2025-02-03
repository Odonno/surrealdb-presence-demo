DEFINE TABLE OVERWRITE room SCHEMAFULL
    PERMISSIONS
        FOR select FULL
        FOR create, update, delete NONE;

DEFINE FIELD OVERWRITE name ON room TYPE string;
DEFINE FIELD OVERWRITE owner ON room TYPE option<record<user>>;
DEFINE FIELD OVERWRITE users ON room TYPE set<record<user>> DEFAULT [];
DEFINE FIELD OVERWRITE created_at ON room TYPE datetime DEFAULT time::now();

DEFINE INDEX OVERWRITE unique_name ON room COLUMNS name UNIQUE;