DEFINE TABLE presence SCHEMAFULL
    PERMISSIONS
        FOR select FULL
        FOR create, update WHERE user == $auth.id
        FOR delete NONE;

DEFINE FIELD room ON presence TYPE record<room>;
DEFINE FIELD user ON presence TYPE record<user>;
DEFINE FIELD updated_at ON presence TYPE datetime VALUE time::now() DEFAULT time::now();
DEFINE FIELD status ON presence TYPE string ASSERT $value IN ["joined", "left"] DEFAULT "joined";