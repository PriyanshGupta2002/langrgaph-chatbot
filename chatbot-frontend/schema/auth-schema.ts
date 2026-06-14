import * as z from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(40, "Username must be at most 40 characters."),

  email: z.email("Please enter a valid email address."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character.",
    ),
});

export const signinSchema = z.object({
  email: z.email("Please enter a valid email address."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character.",
    ),
});
