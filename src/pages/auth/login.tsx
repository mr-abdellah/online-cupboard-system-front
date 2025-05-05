"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/services/auth";
import { useNavigate } from "react-router";

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Handle successful login
      console.log("Login successful:", data);
      navigate("/dashboard");
    },
    onError: (error) => {
      // Handle login error
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
    mutate(data);
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Section gauche avec fond bleu */}
      <div className="hidden md:flex md:w-1/2 bg-[#3b5de7] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(59, 93, 231, 0.9) 0%, rgba(59, 93, 231, 0.8) 100%)",
          }}
        ></div>

        {/* Formes géométriques en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-[20%] left-[10%] w-[80%] h-[60%] bg-[#4e6ef2] opacity-30 transform rotate-12"></div>
          <div className="absolute top-[30%] left-[20%] w-[60%] h-[40%] bg-[#6a84f3] opacity-20 transform -rotate-6"></div>
        </div>

        {/* Logo en haut à gauche */}
        <div className="absolute top-8 left-8 text-white">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        {/* Contenu principal */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Conçu pour les Particuliers
          </h2>
          <p className="text-white/80 mb-8">
            Consultez vos analyses et gérez vos données à distance, depuis
            n'importe où !
          </p>

          {/* Indicateurs de page */}
          <div className="flex space-x-2 mt-8">
            <div className="w-8 h-1 bg-white rounded-full"></div>
            <div className="w-2 h-1 bg-white/40 rounded-full"></div>
            <div className="w-2 h-1 bg-white/40 rounded-full"></div>
          </div>

          {/* Interface de l'application (simplifiée) */}
          <div className="mt-16 bg-[#2d4ccc] rounded-lg shadow-lg p-4 max-w-md">
            <div className="flex items-center border-b border-white/10 pb-3 mb-4">
              <svg
                className="w-5 h-5 mr-2 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-white font-medium">Example File</span>
            </div>

            {/* Barre d'outils simplifiée */}
            <div className="flex space-x-2 mb-4 border-b border-white/10 pb-3">
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Tableau simplifié */}
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="flex">
                  <div className="w-8 text-white/60 text-sm flex items-center justify-center">
                    {row}
                  </div>
                  <div className="flex-1 h-6 bg-white/10 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section droite avec formulaire */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-gray-800 mb-8">
            Connexion
          </h1>

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
                {/* <Link
                  to="/auth/reset-password"
                  className="text-sm text-[#3b5de7] hover:underline"
                >
                  Réinitialiser le mot de passe
                </Link> */}
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
