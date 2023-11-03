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
import { surrealInstance } from "@/lib/db";
import { Loader2 } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";

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
  const { values, isValid, handleOnChange, handleOnBlur, handleOnFocus } =
    useAtomValue(formControlAtom);

  const queryClient = useQueryClient();

  const signup = useMutation({
    mutationFn: async (props: SignupMutationProps) => {
      const token = await surrealInstance.signup({
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

      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Sign up</DialogTitle>
          <DialogDescription>Registers a new acount.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              className="col-span-3"
              value={values.username}
              onChange={(e) => {
                handleOnChange("username")(e.target.value);
              }}
              onFocus={handleOnFocus("username")}
              onBlur={handleOnBlur("username")}
            />
          </div>

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
            <Label htmlFor="confirm-email" className="text-right">
              Confirm email
            </Label>
            <Input
              id="confirm-email"
              type="email"
              className="col-span-3"
              value={values.confirmEmail}
              onChange={(e) => {
                handleOnChange("confirmEmail")(e.target.value);
              }}
              onFocus={handleOnFocus("confirmEmail")}
              onBlur={handleOnBlur("confirmEmail")}
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirm-password" className="text-right">
              Confirm password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              className="col-span-3"
              value={values.confirmPassword}
              onChange={(e) => {
                handleOnChange("confirmPassword")(e.target.value);
              }}
              onFocus={handleOnFocus("confirmPassword")}
              onBlur={handleOnBlur("confirmPassword")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={!isValid || signup.isPending}
            onClick={handleSignUp}
          >
            {signup.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Register
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpDialog;
