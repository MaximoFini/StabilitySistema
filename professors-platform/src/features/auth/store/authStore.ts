import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { uploadProfileImage } from "@/lib/supabase-storage";
import type { User } from "@supabase/supabase-js";

export interface Professor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "student" | "coach";
  createdAt: string;
  profileImage?: string;
  hasCompletedProfile?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "student" | "coach";
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface StudentProfileData {
  phone: string;
  instagram?: string;
  profileImage?: File;
  birthDate: string;
  gender: "male" | "female" | "other";
  height: number;
  weight: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  primaryGoal: "aesthetic" | "sports" | "health" | "rehabilitation";
  trainingExperience: "none" | "beginner" | "intermediate" | "advanced";
  sports: string;
  previousInjuries?: string;
  medicalConditions?: string;
}

interface AuthState {
  professor: Professor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  lastActivity: number | null;
  tokenExpiry: number | null;

  // Actions
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  refreshToken: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateActivity: () => void;
  initializeAuth: () => Promise<void>;
  completeStudentProfile: (data: StudentProfileData) => Promise<void>;
}

// Inactivity timeout (disabled - session persists until manual logout)
// const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes in ms
// Token expiry: Handled by Supabase
const TOKEN_EXPIRY_TIME = 60 * 60 * 1000; // 60 minutes in ms

let inactivityTimer: ReturnType<typeof setTimeout> | null = null;

// Helper function to convert Supabase user to Professor
const userToProfessor = async (user: User): Promise<Professor | null> => {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      console.error("Error fetching profile:", error);
      return null;
    }

    // Check if student has completed profile
    let hasCompletedProfile = false;
    if (profile.role === "student") {
      const { data: studentProfile } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      hasCompletedProfile = !!studentProfile;
    } else {
      // Coaches always have completed profile
      hasCompletedProfile = true;
    }

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role as "student" | "coach",
      createdAt: profile.created_at,
      profileImage: profile.profile_image || undefined,
      hasCompletedProfile,
    };
  } catch (error) {
    console.error("Error converting user to professor:", error);
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Setup activity listeners
      const setupActivityListeners = () => {
        const events = ["mousedown", "keypress", "scroll", "touchstart"];

        const handleActivity = () => {
          const state = get();
          if (state.isAuthenticated) {
            state.updateActivity();
          }
        };

        events.forEach((event) => {
          window.addEventListener(event, handleActivity, { passive: true });
        });
      };

      // Initialize activity listeners when store is created
      if (typeof window !== "undefined") {
        setupActivityListeners();
      }

      return {
        professor: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        rememberMe: false,
        lastActivity: null,
        tokenExpiry: null,

        initializeAuth: async () => {
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
              const professor = await userToProfessor(session.user);
              if (professor) {
                const now = Date.now();
                set({
                  professor,
                  isAuthenticated: true,
                  lastActivity: now,
                  tokenExpiry: now + TOKEN_EXPIRY_TIME,
                });
                get().updateActivity();
              }
            }

            // Listen for auth changes (e.g., token expiration, sign out from another tab)
            supabase.auth.onAuthStateChange(async (event, session) => {
              console.log("Auth state changed:", event);

              if (event === "SIGNED_OUT" || !session) {
                set({
                  professor: null,
                  isAuthenticated: false,
                  error: null,
                  rememberMe: false,
                  lastActivity: null,
                  tokenExpiry: null,
                });
              } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                if (session?.user) {
                  const professor = await userToProfessor(session.user);
                  if (professor) {
                    const now = Date.now();
                    set({
                      professor,
                      isAuthenticated: true,
                      lastActivity: now,
                      tokenExpiry: now + TOKEN_EXPIRY_TIME,
                    });
                  }
                }
              }
            });
          } catch (error) {
            console.error("Error initializing auth:", error);
          }
        },

        updateActivity: () => {
          const now = Date.now();
          set({ lastActivity: now });

          // Session persists until manual logout
          // Auto-logout by inactivity is disabled
          // Clear any existing timer
          if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
          }
        },

        login: async (email, password, rememberMe = true) => {
          set({ isLoading: true, error: null });

          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              console.error("[Login Error]", {
                message: error.message,
                status: error.status,
                code: error.code,
              });

              // Detectar tipo de error específico
              let errorMessage = "Credenciales inválidas";

              if (
                error.message
                  .toLowerCase()
                  .includes("invalid login credentials") ||
                error.message
                  .toLowerCase()
                  .includes("invalid email or password")
              ) {
                // Supabase retorna este mensaje genérico para ambos casos
                // Por ahora lo dejamos así, pero técnicamente no distingue entre email no existe vs contraseña incorrecta
                errorMessage = "Email o contraseña incorrectos";
              } else if (
                error.message.toLowerCase().includes("user not found")
              ) {
                errorMessage =
                  "Este email no está registrado en nuestro sistema";
              } else if (
                error.message.toLowerCase().includes("email not confirmed")
              ) {
                errorMessage =
                  "Debes confirmar tu email antes de iniciar sesión";
              } else if (
                error.message.toLowerCase().includes("too many login attempts")
              ) {
                errorMessage =
                  "Has intentado login demasiadas veces. Intenta más tarde";
              }

              throw new Error(errorMessage);
            }

            if (data.user) {
              const professor = await userToProfessor(data.user);

              if (!professor) {
                throw new Error("No se pudo cargar el perfil del usuario");
              }

              const now = Date.now();
              set({
                professor,
                isAuthenticated: true,
                isLoading: false,
                rememberMe: true, // Always persist session until manual logout
                lastActivity: now,
                tokenExpiry: now + TOKEN_EXPIRY_TIME,
              });

              // Start activity tracking
              get().updateActivity();
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Error de autenticación";
            set({
              error: errorMessage,
              isLoading: false,
            });
            throw error;
          }
        },

        register: async (data) => {
          set({ isLoading: true, error: null });

          try {
            // 1. Create auth user
            const { data: authData, error: authError } =
              await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                  emailRedirectTo: undefined, // Don't send confirmation email
                  data: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    role: data.role,
                  },
                },
              });

            if (authError) {
              console.error("Auth error:", authError);
              throw authError;
            }

            if (!authData.user) {
              throw new Error("No se pudo crear el usuario");
            }

            console.log("User created:", authData.user.id);

            // 2. Wait a bit for trigger to execute
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // 3. Try to get the profile (trigger should have created it)
            let professor = await userToProfessor(authData.user);

            // 4. If profile doesn't exist, create it manually
            if (!professor) {
              console.log("Profile not found, creating manually...");

              const { error: profileError } = await supabase
                .from("profiles")
                .insert({
                  id: authData.user.id,
                  email: data.email,
                  first_name: data.firstName,
                  last_name: data.lastName,
                  role: data.role,
                });

              if (profileError) {
                console.error("Profile creation error:", profileError);
                throw new Error("No se pudo crear el perfil");
              }

              // Try to get professor again
              professor = await userToProfessor(authData.user);

              if (!professor) {
                throw new Error(
                  "No se pudo obtener el perfil después de crearlo",
                );
              }
            }

            const now = Date.now();
            set({
              professor,
              isAuthenticated: true,
              isLoading: false,
              rememberMe: true,
              lastActivity: now,
              tokenExpiry: now + TOKEN_EXPIRY_TIME,
            });

            // Start activity tracking
            get().updateActivity();
          } catch (error) {
            console.error("Registration error:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Error en el registro";
            set({
              error: errorMessage,
              isLoading: false,
            });
            throw error;
          }
        },

        refreshToken: async () => {
          console.log("Refreshing token...");

          try {
            const { error } = await supabase.auth.refreshSession();

            if (error) throw error;

            const now = Date.now();
            set({
              tokenExpiry: now + TOKEN_EXPIRY_TIME,
              lastActivity: now,
            });

            console.log("Token refreshed successfully");
          } catch (error) {
            console.error("Error refreshing token", error);
            // If refresh fails, logout user
            get().logout();
          }
        },

        loginWithGoogle: async () => {
          try {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/`,
              },
            });

            if (error) throw error;

            // OAuth redirect will handle the rest
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Error con Google OAuth";
            set({ error: errorMessage });
            throw error;
          }
        },

        logout: async () => {
          // Clear timers
          if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
          }

          try {
            await supabase.auth.signOut();
          } catch (error) {
            console.error("Error signing out:", error);
          }

          set({
            professor: null,
            isAuthenticated: false,
            error: null,
            rememberMe: false,
            lastActivity: null,
            tokenExpiry: null,
          });
        },

        completeStudentProfile: async (data: StudentProfileData) => {
          set({ isLoading: true, error: null });

          try {
            console.log(
              "[completeStudentProfile] 🚀 INICIANDO registro de perfil",
            );

            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
              console.error(
                "[completeStudentProfile] ❌ Usuario no autenticado",
              );
              throw new Error("Usuario no autenticado");
            }

            console.log(
              "[completeStudentProfile] ✅ Usuario autenticado:",
              user.id,
            );

            const professor = get().professor;
            if (!professor || professor.role !== "student") {
              console.error(
                "[completeStudentProfile] ❌ Rol inválido:",
                professor?.role,
              );
              throw new Error("Solo los alumnos pueden completar este perfil");
            }

            console.log("[completeStudentProfile] ✅ Rol verificado: student");

            // Upload profile image if provided
            let profileImageUrl: string | null = null;
            if (data.profileImage) {
              console.log(
                "[completeStudentProfile] 📤 Subiendo imagen de perfil...",
              );
              try {
                profileImageUrl = await uploadProfileImage(
                  user.id,
                  data.profileImage,
                );
                console.log(
                  "[completeStudentProfile] ✅ Imagen subida exitosamente:",
                  profileImageUrl,
                );
              } catch (uploadError) {
                console.error(
                  "[completeStudentProfile] ⚠️ Error al subir imagen (continuando sin imagen):",
                  uploadError,
                );
                // Continuar sin imagen en lugar de fallar completamente
                profileImageUrl = null;
              }
            } else {
              console.log("[completeStudentProfile] ℹ️ Sin imagen de perfil");
            }

            // Prepare data for insertion
            const insertData = {
              id: user.id,
              phone: data.phone,
              instagram: data.instagram || null,
              profile_image_url: profileImageUrl,
              birth_date: data.birthDate,
              gender: data.gender,
              height_cm: data.height,
              weight_kg: data.weight,
              activity_level: data.activityLevel,
              primary_goal: data.primaryGoal,
              training_experience: data.trainingExperience,
              sports: data.sports,
              previous_injuries: data.previousInjuries || null,
              medical_conditions: data.medicalConditions || null,
            };

            console.log(
              "[completeStudentProfile] 📝 Datos a insertar:",
              insertData,
            );

            // Insert student profile data
            console.log(
              "[completeStudentProfile] 💾 Insertando en student_profiles...",
            );
            const { data: insertedData, error: profileError } = await supabase
              .from("student_profiles")
              .insert(insertData)
              .select();

            if (profileError) {
              console.error("[completeStudentProfile] ❌ ERROR EN INSERT:", {
                error: profileError,
                message: profileError.message,
                details: profileError.details,
                hint: profileError.hint,
                code: profileError.code,
              });
              throw new Error(
                `Error al guardar perfil: ${profileError.message}`,
              );
            }

            console.log(
              "[completeStudentProfile] ✅ Datos insertados exitosamente:",
              insertedData,
            );

            // Update professor state with new data
            set({
              professor: {
                ...professor,
                profileImage: profileImageUrl || undefined,
                hasCompletedProfile: true,
              },
            });

            console.log(
              "[completeStudentProfile] 🎉 PERFIL COMPLETADO EXITOSAMENTE",
            );
          } catch (error) {
            console.error("[completeStudentProfile] ❌ ERROR CRÍTICO:", error);
            console.error(
              "[completeStudentProfile] Tipo de error:",
              typeof error,
            );
            console.error(
              "[completeStudentProfile] Error completo:",
              JSON.stringify(error, null, 2),
            );

            const errorMessage =
              error instanceof Error
                ? error.message
                : "Error al completar el perfil";
            set({ error: errorMessage });
            throw error;
          } finally {
            // Siempre resetear isLoading, incluso si hay error
            set({ isLoading: false });
          }
        },

        clearError: () => set({ error: null }),

        setLoading: (loading) => set({ isLoading: loading }),
      };
    },
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Always persist authentication state
      partialize: (state) => ({
        professor: state.professor,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
        lastActivity: state.lastActivity,
        tokenExpiry: state.tokenExpiry,
      }),
    },
  ),
);
