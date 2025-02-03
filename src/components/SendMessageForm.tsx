import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import type { Id, Room } from "@/lib/models";
import sendMessageQuery from "@/mutations/sendMessage.surql?raw";
import { useMutation } from "@tanstack/react-query";
import { Loader2, SendIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export type SendMessageFormProps = {
	room: Room;
};

type SendMessageMutationProps = {
	room_id: Id;
	content: string;
};

const SendMessageForm = ({ room }: SendMessageFormProps) => {
	const [content, setContent] = useState("");

	const isValid = content.length > 0;

	const dbClient = useSurrealDbClient();

	const send = useMutation({
		mutationKey: ["sendMessage", room.id],
		mutationFn: async (props: SendMessageMutationProps) => {
			await dbClient.query(sendMessageQuery, props);
		},
		onSettled: () => {
			setContent("");
		},
	});

	const handleSend = async () => {
		await send.mutateAsync({
			room_id: room.id,
			content,
		});
	};

	return (
		<section className="mt-4">
			<Textarea
				placeholder="Type your message here."
				value={content}
				onChange={(e) => {
					setContent(e.target.value);
				}}
			/>

			<div className="flex justify-end">
				<Button
					type="submit"
					variant="outline"
					className="mt-1"
					disabled={!isValid || send.isPending}
					onClick={handleSend}
				>
					{send.isPending ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<SendIcon className="mr-2 h-4 w-4" />
					)}
					Send message
				</Button>
			</div>
		</section>
	);
};

export default SendMessageForm;
