import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DB, NS, USER_SCOPE } from "@/constants/db";
import { ACCESS_TOKEN } from "@/constants/storage";
import { surrealInstance } from "@/lib/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn } from "lucide-react";
import { z } from "zod";
import { atomWithFormControls, atomWithValidate } from "jotai-form";
import { useAtomValue } from "jotai";

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);

const emailAtom = atomWithValidate("", {
  validate: async (email) => {
    try {
      emailSchema.parse(email);
      return email;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw err.issues;
    }
  },
});

const passwordAtom = atomWithValidate("", {
  validate: async (password) => {
    try {
      passwordSchema.parse(password);
      return password;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw err.issues;
    }
  },
});

const formControlAtom = atomWithFormControls({
  email: emailAtom,
  password: passwordAtom,
});

type SigninMutationProps = {
  email: string;
  password: string;
};

const SignInPopover = () => {
  const { values, isValid, handleOnChange, handleOnBlur, handleOnFocus } =
    useAtomValue(formControlAtom);

  const queryClient = useQueryClient();

  const signin = useMutation({
    mutationFn: async (props: SigninMutationProps) => {
      const token = await surrealInstance.signin({
        NS,
        DB,
        SC: USER_SCOPE,
        ...props,
      });

      if (token) {
        localStorage.setItem(ACCESS_TOKEN, token);
      }

      return !!token;
    },
    onSettled: () => {
      queryClient.resetQueries({ queryKey: ["users", "current"] });
    },
  });

  const handleSignIn = async () => {
    await signin.mutateAsync({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <LogIn className="mr-2 h-4 w-4" />
          Sign in
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              className="col-span-3"
              value={values.email}
              onChange={(e) => {
                handleOnChange("email")(e.target.value);
              }}
              onFocus={handleOnFocus("email")}
              onBlur={handleOnBlur("email")}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              className="col-span-3"
              value={values.password}
              onChange={(e) => {
                handleOnChange("password")(e.target.value);
              }}
              onFocus={handleOnFocus("password")}
              onBlur={handleOnBlur("password")}
            />
          </div>
        </div>

        <div className="flex justify-end items-center">
          <Button
            type="submit"
            className="text-end"
            disabled={!isValid || signin.isPending}
            onClick={handleSignIn}
          >
            {signin.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Submit
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SignInPopover;
