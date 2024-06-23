import { Id, Room } from "@/lib/models";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import sendMessageQuery from "@/mutations/sendMessage.surql?raw";
import { Loader2, SendIcon } from "lucide-react";
import { useState } from "react";

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
      const response = await dbClient.query(sendMessageQuery, props);

      if (!response?.[0] || response[0].status !== "OK") {
        throw new Error();
      }

      // TODO
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
