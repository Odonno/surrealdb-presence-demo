DEFINE TABLE OVERWRITE user SCHEMALESS
    PERMISSIONS
        FOR select FULL
        FOR update WHERE id == $auth.id
        FOR create, delete NONE;

DEFINE FIELD OVERWRITE username ON user TYPE string;
DEFINE FIELD OVERWRITE email ON user TYPE string PERMISSIONS FOR select NONE;
DEFINE FIELD OVERWRITE passcode ON user TYPE string PERMISSIONS FOR select NONE;
DEFINE FIELD OVERWRITE registered_at ON user TYPE datetime DEFAULT time::now();
DEFINE FIELD OVERWRITE avatar ON user TYPE option<string>;

DEFINE INDEX OVERWRITE unique_username ON user COLUMNS username UNIQUE;
DEFINE INDEX OVERWRITE unique_email ON user COLUMNS email UNIQUE;

DEFINE ACCESS OVERWRITE user_access
    ON DATABASE TYPE RECORD
    SIGNUP (
        CREATE user
        SET
            username = $username,
            email = $email,
            avatar = "https://www.gravatar.com/avatar/" + crypto::md5($email) + "?d=identicon",
            passcode = fn::create_passcode($email)
    )
    SIGNIN (
        SELECT *
        FROM user
        WHERE email = $email AND passcode = $passcode
    );