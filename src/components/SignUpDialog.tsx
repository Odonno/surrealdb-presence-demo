import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { atomWithFormControls, atomWithValidate } from "jotai-form";
import { useAtomValue } from "jotai";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DB, NS, USER_SCOPE } from "@/constants/db";
import { ACCESS_TOKEN } from "@/constants/storage";
import { CopyIcon, Loader2, UserPlus } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import { useGetPasscode } from "@/api/getPasscode";

const usernameSchema = z.string().min(2);
const emailSchema = z.string().email();

const usernameAtom = atomWithValidate("", {
  validate: async (username) => {
    try {
      usernameSchema.parse(username);
      return username;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw err.issues;
    }
  },
});

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

const confirmEmailAtom = atomWithValidate("", {
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

const formControlAtom = atomWithFormControls(
  {
    username: usernameAtom,
    email: emailAtom,
    confirmEmail: confirmEmailAtom,
  },
  {
    validate: (values) => {
      if (values.email !== values.confirmEmail) {
        throw new Error("Emails don't match");
      }
    },
  }
);

type SignupMutationProps = {
  username: string;
  email: string;
};

const SignUpDialog = () => {
  const {
    values,
    isValid,
    touched,
    fieldErrors,
    error,
    handleOnChange,
    handleOnBlur,
    handleOnFocus,
  } = useAtomValue(formControlAtom);

  const queryClient = useQueryClient();
  const dbClient = useSurrealDbClient();

  const { data: passcode } = useGetPasscode(values.email);

  const signup = useMutation({
    mutationKey: ["signup"],
    mutationFn: async (props: SignupMutationProps) => {
      const token = await dbClient.signup({
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
      queryClient.resetQueries({ queryKey: queryKeys.users.current.queryKey });
    },
  });

  const handleSignUp = async () => {
    await signup.mutateAsync({
      username: values.username,
      email: values.email,
    });
  };

  const handleCopyPasscode = async () => {
    if (passcode) {
      await navigator.clipboard.writeText(passcode);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">
          <UserPlus className="mr-2 h-4 w-4" />
          Sign up
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Sign up</DialogTitle>
          <DialogDescription>Registers a new account.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={values.username}
              onChange={(e) => {
                handleOnChange("username")(e.target.value);
              }}
              onFocus={handleOnFocus("username")}
              onBlur={handleOnBlur("username")}
            />
            {touched.username && fieldErrors.username ? (
              <p className="text-sm font-medium text-destructive">
                {fieldErrors.username[0].message}
              </p>
            ) : null}
          </div>

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

            <Label htmlFor="confirm-email">Confirm email</Label>
            <Input
              id="confirm-email"
              type="email"
              value={values.confirmEmail}
              onChange={(e) => {
                handleOnChange("confirmEmail")(e.target.value);
              }}
              onFocus={handleOnFocus("confirmEmail")}
              onBlur={handleOnBlur("confirmEmail")}
            />
            {touched.confirmEmail && fieldErrors.confirmEmail ? (
              <p className="text-sm font-medium text-destructive">
                {fieldErrors.confirmEmail[0].message}
              </p>
            ) : null}
          </div>

          {passcode ? (
            <div className="grid gap-2">
              <Label htmlFor="passcode">Passcode</Label>
              <div>
                <span className="text-sm text-muted-foreground">
                  Your generated passcode is
                </span>
              </div>
              <div className="flex justify-start items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="mr-2"
                  onClick={handleCopyPasscode}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>

                <code className="tracking-widest">{passcode}</code>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex !flex-col items-end">
          <Button
            type="submit"
            disabled={!isValid || signup.isPending}
            onClick={handleSignUp}
            className="block"
          >
            {signup.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Register
          </Button>

          {error ? (
            <p className="mt-2 text-sm font-medium text-destructive">
              {(error as Error).message}
            </p>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpDialog;
