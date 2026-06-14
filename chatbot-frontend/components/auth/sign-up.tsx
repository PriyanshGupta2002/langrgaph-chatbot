/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { signupSchema } from "@/schema/auth-schema";
import { Button } from "../ui/button";
import { useRegister } from "@/services/auth/auth.query";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

const SignUpForm = () => {
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      username: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const { mutateAsync: onRegister } = useRegister();
  const router = useRouter();

  async function onSubmit(data: z.infer<typeof signupSchema>) {
    // Do something with the form values.
    try {
      await onRegister(data);
      router.push("/sign-in");
      return toast.success("User registered successfully");
    } catch (error: any) {
      console.log("Error while registering user", error);
      return toast.error("Cannot register user");
    }
  }
  return (
    <Card className="w-full max-w-md border-border/50 shadow-xl">
      <CardHeader className="space-y-3 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">
          Create your account
        </CardTitle>

        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          Sign up to start chatting with AI, save conversations, and access your
          chat history across devices.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="signup"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Name</FieldLabel>

                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
                    autoComplete="name"
                    className="h-11"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Email Address</FieldLabel>

                  <Input
                    {...field}
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="john@example.com"
                    autoComplete="email"
                    className="h-11"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Username</FieldLabel>

                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder="johndoe"
                    autoComplete="username"
                    className="h-11"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Password</FieldLabel>

                  <Input
                    {...field}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="h-11"
                  />

                  <p className="mt-1 text-xs text-muted-foreground">
                    Minimum 8 characters with uppercase, number and special
                    character.
                  </p>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
