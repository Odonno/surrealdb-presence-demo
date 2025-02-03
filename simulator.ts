import { faker } from "@faker-js/faker";
import { Surreal } from "surrealdb";
import { DB, NS, SURREAL_ENDPOINT, USER_ACCESS } from "./src/constants/db";
import { SECONDS_PER_MINUTE } from "./src/constants/time";
import createRoomQuery from "./src/mutations/createRoom.surql" with {
	type: "text",
};
import joinRoomQuery from "./src/mutations/joinRoom.surql" with {
	type: "text",
};
import leaveRoomQuery from "./src/mutations/leaveRoom.surql" with {
	type: "text",
};
import sendMessageQuery from "./src/mutations/sendMessage.surql" with {
	type: "text",
};

type NumberRange = [number, number];

type SimulatorConfig = {
	baseNumberOfUsers: NumberRange;
	newUsersPerMinute: NumberRange;
	createRoomsPerMinute: NumberRange;
	joinRoomsPerMinute: NumberRange;
	leaveRoomsPerMinute: NumberRange;
	messagesPerMinute: NumberRange;
};
type IterationSimulatorConfig = {
	[Key in keyof SimulatorConfig]: number;
};

const config: SimulatorConfig = {
	baseNumberOfUsers: [500, 500],
	newUsersPerMinute: [10, 50],
	createRoomsPerMinute: [2, 5],
	joinRoomsPerMinute: [5, 20],
	leaveRoomsPerMinute: [3, 10],
	messagesPerMinute: [20, 200],
};

validateConfig(config);

const rootClient = await createSurrealClient();
rootClient.signin({ username: "root", password: "root" });

let iterationsInMinute = 0;
let currentIterationConfig = generateCurrentIterationConfig(config);

if (currentIterationConfig.baseNumberOfUsers > 0) {
	for (let i = 0; i < currentIterationConfig.baseNumberOfUsers; i++) {
		await createUser();
	}
}

let previousConfigResult = {
	newUsersPerMinute: 0,
	createRoomsPerMinute: 0,
	joinRoomsPerMinute: 0,
	leaveRoomsPerMinute: 0,
	messagesPerMinute: 0,
};

while (true) {
	const start = new Date();

	iterationsInMinute = (iterationsInMinute + 1) % SECONDS_PER_MINUTE;

	const shouldReset = iterationsInMinute === 0;
	if (shouldReset) {
		currentIterationConfig = generateCurrentIterationConfig(config);
		previousConfigResult = {
			newUsersPerMinute: 0,
			createRoomsPerMinute: 0,
			joinRoomsPerMinute: 0,
			leaveRoomsPerMinute: 0,
			messagesPerMinute: 0,
		};
	}

	const currentTotalPercent = (iterationsInMinute + 1) / SECONDS_PER_MINUTE;

	const currentConfigResult = {
		newUsersPerMinute:
			currentIterationConfig.newUsersPerMinute * currentTotalPercent,
		createRoomsPerMinute:
			currentIterationConfig.createRoomsPerMinute * currentTotalPercent,
		joinRoomsPerMinute:
			currentIterationConfig.joinRoomsPerMinute * currentTotalPercent,
		leaveRoomsPerMinute:
			currentIterationConfig.leaveRoomsPerMinute * currentTotalPercent,
		messagesPerMinute:
			currentIterationConfig.messagesPerMinute * currentTotalPercent,
	};

	const createUserPromises: Promise<void>[] = [];
	const createRoomPromises: Promise<void>[] = [];
	const joinRoomPromises: Promise<void>[] = [];
	const leaveRoomPromises: Promise<void>[] = [];
	const sendMessagePromises: Promise<void>[] = [];

	const numberOfUsersToCreate =
		currentConfigResult.newUsersPerMinute -
		previousConfigResult.newUsersPerMinute;
	for (let i = 0; i < numberOfUsersToCreate; i++) {
		createUserPromises.push(createUser());
		previousConfigResult.newUsersPerMinute++;
	}

	const numberOfRoomsToCreate =
		currentConfigResult.createRoomsPerMinute -
		previousConfigResult.createRoomsPerMinute;
	for (let i = 0; i < numberOfRoomsToCreate; i++) {
		createRoomPromises.push(tryCreateRoom());
		previousConfigResult.createRoomsPerMinute++;
	}

	const numberOfRoomsToJoin =
		currentConfigResult.joinRoomsPerMinute -
		previousConfigResult.joinRoomsPerMinute;
	for (let i = 0; i < numberOfRoomsToJoin; i++) {
		joinRoomPromises.push(tryJoinRoom());
		previousConfigResult.joinRoomsPerMinute++;
	}

	const numberOfRoomsToLeave =
		currentConfigResult.leaveRoomsPerMinute -
		previousConfigResult.leaveRoomsPerMinute;
	for (let i = 0; i < numberOfRoomsToLeave; i++) {
		leaveRoomPromises.push(tryLeaveRoom());
		previousConfigResult.leaveRoomsPerMinute++;
	}

	const numberOfMessagesToSend =
		currentConfigResult.messagesPerMinute -
		previousConfigResult.messagesPerMinute;
	for (let i = 0; i < numberOfMessagesToSend; i++) {
		sendMessagePromises.push(trySendMessage());
		previousConfigResult.messagesPerMinute++;
	}

	for (const promise of [
		...createUserPromises,
		...createRoomPromises,
		...joinRoomPromises,
		...leaveRoomPromises,
		...sendMessagePromises,
	]) {
		await promise;
	}

	if (iterationsInMinute % 10 === 0) {
		await signalAllPresences();
	}

	const end = new Date();
	const diff = end.getTime() - start.getTime();

	if (diff < 1000) {
		await Bun.sleep(1000 - diff);
	}
}

async function createSurrealClient() {
	const client = new Surreal();
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	await client.connect(SURREAL_ENDPOINT!, { namespace: NS!, database: DB! });

	return client;
}

function validateConfig(config: SimulatorConfig): void {
	validateNumberRange(config.baseNumberOfUsers);
	validateNumberRange(config.newUsersPerMinute);
	validateNumberRange(config.createRoomsPerMinute);
	validateNumberRange(config.joinRoomsPerMinute);
	validateNumberRange(config.leaveRoomsPerMinute);
	validateNumberRange(config.messagesPerMinute);
}

function validateNumberRange([min, max]: NumberRange): void {
	if (min < 0 || max < 0) {
		throw new Error("Number range must be positive");
	}

	if (min > max) {
		throw new Error("Minimum must be less than maximum");
	}
}

function generateCurrentIterationConfig(
	config: SimulatorConfig,
): IterationSimulatorConfig {
	return {
		baseNumberOfUsers: generateRandomFromRange(config.baseNumberOfUsers),
		newUsersPerMinute: generateRandomFromRange(config.newUsersPerMinute),
		createRoomsPerMinute: generateRandomFromRange(config.createRoomsPerMinute),
		joinRoomsPerMinute: generateRandomFromRange(config.joinRoomsPerMinute),
		leaveRoomsPerMinute: generateRandomFromRange(config.leaveRoomsPerMinute),
		messagesPerMinute: generateRandomFromRange(config.messagesPerMinute),
	};
}

function generateRandomFromRange([min, max]: NumberRange): number {
	return Math.random() * (max - min) + min;
}

async function createUser() {
	const firstName = faker.person.firstName();
	const lastName = faker.person.lastName();

	const username = faker.internet.userName({ firstName, lastName });
	const email = faker.internet.email({ firstName, lastName });

	const client = await createSurrealClient();

	await client.signup({ access: USER_ACCESS, variables: { username, email } });
	await client.close();
}

async function tryCreateRoom(): Promise<void> {
	const user = await pickUser();

	if (!user) {
		return Promise.reject("No users available to join");
	}

	const client = await createSurrealClient();

	await client.signin({ access: USER_ACCESS, variables: user });
	await client.query(createRoomQuery);
	await client.close();
}

async function tryJoinRoom(): Promise<void> {
	const user = await pickUser();
	const room = await pickRoom();

	if (!user) {
		return Promise.reject("No users available to join");
	}
	if (!room) {
		return Promise.reject("No rooms available to join");
	}

	const client = await createSurrealClient();

	await client.signin({ access: USER_ACCESS, variables: user });
	await client.query(joinRoomQuery, {
		room_id: room.id,
	});
	await client.close();
}

async function tryLeaveRoom(): Promise<void> {
	const user = await pickUser();
	const room = await pickRoom();

	if (!user) {
		return Promise.reject("No users available to join");
	}
	if (!room) {
		return Promise.reject("No rooms available to join");
	}

	const client = await createSurrealClient();

	await client.signin({ access: USER_ACCESS, variables: user });
	try {
		await client.query(leaveRoomQuery, {
			room_id: room.id,
		});
	} catch (e) {
		// 💡 leaving room can fail beause of randomness
	}
	await client.close();
}

async function trySendMessage(): Promise<void> {
	const user = await pickUser();
	const room = await pickRoom();

	if (!user) {
		return Promise.reject("No users available to join");
	}
	if (!room) {
		return Promise.reject("No rooms available to join");
	}

	const client = await createSurrealClient();

	await client.signin({ access: USER_ACCESS, variables: user });
	await client.query(sendMessageQuery, {
		room_id: room.id,
		content: faker.lorem.sentence(),
	});
	await client.close();
}

type PickedUser = {
	email: string;
	passcode: string;
};

async function pickUser() {
	try {
		const result = await rootClient.query<PickedUser[]>(`
SELECT email, passcode
FROM ONLY user
ORDER BY rand()
LIMIT 1;
`);

		return result[0];
	} catch (e) {
		console.error(e);
	}
}

type PickedRoom = {
	id: string;
};

async function pickRoom() {
	try {
		const result = await rootClient.query<PickedRoom[]>(`
SELECT id
FROM ONLY room
ORDER BY rand()
LIMIT 1;
`);

		return result[0];
	} catch (e) {
		console.error(e);
	}
}

async function signalAllPresences(): Promise<void> {
	try {
		await rootClient.query(`
LET $users = (SELECT array::group(users) AS users FROM room GROUP ALL)[0].users;

FOR $user IN $users {
    CREATE presence SET user = $user.id;
}
`);
	} catch (e) {
		console.error(e);
	}
}

//export {};
