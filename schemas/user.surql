DEFINE TABLE user SCHEMALESS
    PERMISSIONS
        FOR select FULL
        FOR update WHERE id == $auth.id
        FOR create, delete NONE;

DEFINE FIELD username ON user TYPE string;
DEFINE FIELD email ON user TYPE string;
DEFINE FIELD password ON user TYPE string PERMISSIONS FOR select NONE;
DEFINE FIELD registered_at ON user TYPE datetime DEFAULT time::now();
DEFINE FIELD avatar ON user TYPE option<string>;

DEFINE INDEX unique_username ON user COLUMNS username UNIQUE;
DEFINE INDEX unique_email ON user COLUMNS email UNIQUE;

DEFINE SCOPE user_scope
    SESSION 7d
    SIGNUP (
        CREATE user
        SET
            username = $username,
            email = $email,
            avatar = "https://www.gravatar.com/avatar/" + crypto::md5($email),
            password = crypto::argon2::generate($password)
    )
    SIGNIN (
        SELECT *
        FROM user
        WHERE email = $email AND crypto::argon2::compare(password, $password)
    );
