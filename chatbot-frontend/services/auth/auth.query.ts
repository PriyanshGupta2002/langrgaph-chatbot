import { useMutation } from "@tanstack/react-query";
import { loginUser, registerUser } from "./auth.api";

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
  });
};
