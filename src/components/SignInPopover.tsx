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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn } from "lucide-react";
import { z } from "zod";
import { atomWithFormControls, atomWithValidate } from "jotai-form";
import { useAtomValue } from "jotai";
import { queryKeys } from "@/lib/queryKeys";
import { useSurrealDbClient } from "@/contexts/surrealdb-provider";

const emailSchema = z.string().email();
const passcodeSchema = z.string().min(6).max(6);

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

const passcodeAtom = atomWithValidate("", {
  validate: async (passcode) => {
    try {
      passcodeSchema.parse(passcode);
      return passcode;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw err.issues;
    }
  },
});

const formControlAtom = atomWithFormControls({
  email: emailAtom,
  passcode: passcodeAtom,
});

type SigninMutationProps = {
  email: string;
  passcode: string;
};

const SignInPopover = () => {
  const {
    values,
    isValid,
    touched,
    fieldErrors,
    handleOnChange,
    handleOnBlur,
    handleOnFocus,
  } = useAtomValue(formControlAtom);

  const queryClient = useQueryClient();
  const dbClient = useSurrealDbClient();

  const signin = useMutation({
    mutationKey: ["signin"],
    mutationFn: async (props: SigninMutationProps) => {
      const token = await dbClient.signin({
        NS: NS,
        DB: DB,
        SC: USER_SCOPE,
        ...props,
      });

      if (token) {
        localStorage.setItem(ACCESS_TOKEN, token);
      }

      return !!token;
    },
    onSettled: () => {
      queryClient.resetQueries({ queryKey: queryKeys.users.current.queryKey });
    },
  });

  const handleSignIn = async () => {
    await signin.mutateAsync({
      email: values.email,
      passcode: values.passcode,
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
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => {
                handleOnChange("email")(e.target.value);
              }}
              onFocus={handleOnFocus("email")}
              onBlur={handleOnBlur("email")}
            />
            {touched.email && fieldErrors.email ? (
              <p className="text-sm font-medium text-destructive">
                {fieldErrors.email[0].message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              type="password"
              value={values.passcode}
              onChange={(e) => {
                handleOnChange("passcode")(e.target.value);
              }}
              onFocus={handleOnFocus("passcode")}
              onBlur={handleOnBlur("passcode")}
            />
            {touched.passcode && fieldErrors.passcode ? (
              <p className="text-sm font-medium text-destructive">
                {fieldErrors.passcode[0].message}
              </p>
            ) : null}
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
