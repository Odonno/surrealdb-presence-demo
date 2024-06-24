DEFINE FUNCTION fn::create_passcode($value: string) {
	RETURN string::slice(crypto::sha1($value), 0, 6);
};