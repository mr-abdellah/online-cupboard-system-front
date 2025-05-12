"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/services/auth";
import { useNavigate } from "react-router";
import { getToken } from "@/utils/token";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const token = getToken();
  if (token) {
    navigate("/dashboard");
  }

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate("/dashboard");
    },
    onError: (error) => {
      // Set the error message to display to the user
      setLoginError(
        "Identifiants incorrects. Veuillez vérifier votre email et mot de passe."
      );
      console.error("Login error:", error);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    // Clear any previous error messages when attempting a new login
    setLoginError(null);
    mutate(data);
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      <div className="hidden md:flex md:w-1/2 bg-[#3b5de7] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(59, 93, 231, 0.9) 0%, rgba(59, 93, 231, 0.8) 100%)",
          }}
        ></div>

        <div className="absolute inset-0">
          <div className="absolute top-[20%] left-[10%] w-[80%] h-[60%] bg-[#4e6ef2] opacity-30 transform rotate-12"></div>
          <div className="absolute top-[30%] left-[20%] w-[60%] h-[40%] bg-[#6a84f3] opacity-20 transform -rotate-6"></div>
        </div>

        <div className="relative z-10 flex flex-col px-12 pt-10 text-white w-full max-h-[50vh] h-full justify-between mb-auto">
          <div className="flex items-center gap-6">
            <img src="/logo.png" className="size-28 rounded-full" alt="Logo" />
            <div className="text-sm leading-relaxed pt-2">
              <p>République Algérienne Démocratique et Populaire</p>
              <p>Ministère de l'Habitat, de l'Urbanisme et de la Ville</p>
              <p>
                Office De La Promotion Et De La Gestion Immobilière De La Wilaya
                De Tizi-ouzou
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-6xl font-bold mb-1">Plateforme GED</h2>
            <p className="text-white/80 text-2xl">
              Gestion Electronique de Documents
            </p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="md:hidden flex flex-col justify-center items-center gap-6 mb-20">
          <img src="/logo.png" className="size-28 rounded-full" alt="Logo" />
          <div className="text-sm leading-relaxed pt-2 text-center md:text-left">
            <p>République Algérienne Démocratique et Populaire</p>
            <p>Ministère de l'Habitat, de l'Urbanisme et de la Ville</p>
            <p>
              Office De La Promotion Et De La Gestion Immobilière De La Wilaya
              De Tizi-ouzou
            </p>
          </div>
        </div>
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-gray-800 mb-8">
            Connexion
          </h1>

          {/* Error message display */}
          {loginError && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md flex items-start gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                {...register("email")}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3b5de7] focus:border-[#3b5de7]"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3b5de7] focus:border-[#3b5de7]"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register("rememberMe")}
                className="h-4 w-4 text-[#3b5de7] border-gray-300 rounded focus:ring-[#3b5de7]"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-gray-700"
              >
                Se souvenir du mot de passe
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3b5de7] hover:bg-[#2d4ccc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b5de7]"
            >
              {isPending ? "Connexion en cours..." : "Connexion"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
