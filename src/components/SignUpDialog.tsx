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
import { Loader2 } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import { useSurrealDbClient } from "@/contexts/surrealdb-provider";

const usernameSchema = z.string().min(2);
const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);

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

const confirmPasswordAtom = atomWithValidate("", {
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

const formControlAtom = atomWithFormControls(
  {
    username: usernameAtom,
    email: emailAtom,
    confirmEmail: confirmEmailAtom,
    password: passwordAtom,
    confirmPassword: confirmPasswordAtom,
  },
  {
    validate: (values) => {
      if (values.email !== values.confirmEmail) {
        throw new Error("Emails don't match");
      }
      if (values.password !== values.confirmPassword) {
        throw new Error("Passwords don't match");
      }
    },
  }
);

type SignupMutationProps = {
  username: string;
  email: string;
  password: string;
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

  const signup = useMutation({
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
      password: values.password,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Sign up</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Sign up</DialogTitle>
          <DialogDescription>Registers a new acount.</DialogDescription>
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

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={values.password}
              onChange={(e) => {
                handleOnChange("password")(e.target.value);
              }}
              onFocus={handleOnFocus("password")}
              onBlur={handleOnBlur("password")}
            />
            {touched.password && fieldErrors.password ? (
              <p className="text-sm font-medium text-destructive">
                {fieldErrors.password[0].message}
              </p>
            ) : null}

            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={values.confirmPassword}
              onChange={(e) => {
                handleOnChange("confirmPassword")(e.target.value);
              }}
              onFocus={handleOnFocus("confirmPassword")}
              onBlur={handleOnBlur("confirmPassword")}
            />
            {touched.confirmPassword && fieldErrors.confirmPassword ? (
              <p className="text-sm font-medium text-destructive">
                {fieldErrors.confirmPassword[0].message}
              </p>
            ) : null}
          </div>
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
