import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudentProfileData {
  phone: string;
  instagram?: string;
  birth_date: string;
  gender: "male" | "female" | "other";
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
  primary_goal: "aesthetic" | "sports" | "health" | "rehabilitation";
  training_experience: "none" | "beginner" | "intermediate" | "advanced";
  sports: string;
  previous_injuries?: string;
  medical_conditions?: string;
}

type Section = "personal" | "medical" | "training" | null;

export default function TrainingProfile() {
  const { logout, professor } = useAuthStore();
  const [profileData, setProfileData] = useState<StudentProfileData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<Section>(null);
  const [editingSection, setEditingSection] = useState<Section>(null);
  const [formData, setFormData] = useState<Partial<StudentProfileData>>({});

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfileData(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData(profileData || {});
  };

  const handleCancel = () => {
    setEditingSection(null);
    setFormData({});
  };

  const handleSave = async (_section: Section) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("student_profiles")
        .update(formData)
        .eq("id", user.id);

      if (error) throw error;

      setProfileData({ ...profileData, ...formData } as StudentProfileData);
      setEditingSection(null);
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    }
  };

  const toggleSection = (section: Section) => {
    if (editingSection) return; // No permitir cambiar de sección mientras se edita
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const translateGender = (gender: string) => {
    const translations = {
      male: "Masculino",
      female: "Femenino",
      other: "Otro",
    };
    return translations[gender as keyof typeof translations] || gender;
  };

  const translateActivityLevel = (level: string) => {
    const translations = {
      sedentary: "Sedentario",
      light: "Ligero",
      moderate: "Moderado",
      active: "Activo",
      very_active: "Muy Activo",
    };
    return translations[level as keyof typeof translations] || level;
  };

  const translateGoal = (goal: string) => {
    const translations = {
      aesthetic: "Estética",
      sports: "Deportivo",
      health: "Salud",
      rehabilitation: "Rehabilitación",
    };
    return translations[goal as keyof typeof translations] || goal;
  };

  const translateExperience = (exp: string) => {
    const translations = {
      none: "Ninguna",
      beginner: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado",
    };
    return translations[exp as keyof typeof translations] || exp;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#1F2937] dark:text-gray-100 flex flex-col min-h-screen overflow-hidden">
      <header className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8"></div>
        <h2 className="text-lg font-bold">Perfil</h2>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Profile Header */}
        <div className="flex flex-col items-center pt-6 pb-8 px-4">
          <div className="relative mb-4">
            <div
              className="w-28 h-28 rounded-full bg-center bg-cover shadow-lg border-4 border-white dark:border-surface-dark"
              style={{
                backgroundImage: professor?.profileImage
                  ? `url("${professor.profileImage}")`
                  : `url("https://ui-avatars.com/api/?name=${professor?.firstName}+${professor?.lastName}&size=128&background=0056B2&color=fff")`,
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-[#101418] dark:text-white mb-2">
            {professor?.firstName} {professor?.lastName}
          </h1>
        </div>

        {/* Collapsible Sections */}
        <div className="px-4 space-y-3">
          {/* Información Personal */}
          <div className="bg-white dark:bg-surface-dark/50 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection("personal")}
              className="w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-surface-dark transition-colors"
              disabled={editingSection !== null}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 mr-4 shrink-0">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-base font-semibold text-[#101418] dark:text-white">
                  Información Personal
                </h3>
                <p className="text-sm text-gray-500">
                  Datos de contacto y personales
                </p>
              </div>
              <span
                className={cn(
                  "material-symbols-outlined text-gray-400 transition-transform",
                  expandedSection === "personal" && "rotate-180",
                )}
              >
                expand_more
              </span>
            </button>

            {expandedSection === "personal" && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-800">
                {editingSection === "personal" ? (
                  <>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={formData.instagram || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            instagram: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="@usuario"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        value={formData.birth_date || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            birth_date: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Género
                      </label>
                      <select
                        value={formData.gender || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gender: e.target.value as
                              | "male"
                              | "female"
                              | "other",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSave("personal")}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start pt-3">
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Teléfono
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {profileData?.phone || "No especificado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Instagram
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {profileData?.instagram || "No especificado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Fecha de Nacimiento
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {profileData?.birth_date
                              ? new Date(
                                  profileData.birth_date,
                                ).toLocaleDateString("es-ES")
                              : "No especificado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Género
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {profileData?.gender
                              ? translateGender(profileData.gender)
                              : "No especificado"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit("personal")}
                        className="ml-4 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Información Médica */}
          <div className="bg-white dark:bg-surface-dark/50 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection("medical")}
              className="w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-surface-dark transition-colors"
              disabled={editingSection !== null}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/10 text-red-500 mr-4 shrink-0">
                <span className="material-symbols-outlined">
                  medical_services
                </span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-base font-semibold text-[#101418] dark:text-white">
                  Información Médica
                </h3>
                <p className="text-sm text-gray-500">
                  Lesiones y condiciones médicas
                </p>
              </div>
              <span
                className={cn(
                  "material-symbols-outlined text-gray-400 transition-transform",
                  expandedSection === "medical" && "rotate-180",
                )}
              >
                expand_more
              </span>
            </button>

            {expandedSection === "medical" && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-800">
                {editingSection === "medical" ? (
                  <>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Lesiones Previas
                      </label>
                      <textarea
                        value={formData.previous_injuries || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            previous_injuries: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        rows={3}
                        placeholder="Describe lesiones previas..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Condiciones Médicas
                      </label>
                      <textarea
                        value={formData.medical_conditions || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            medical_conditions: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        rows={3}
                        placeholder="Condiciones médicas relevantes..."
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSave("medical")}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start pt-3">
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Lesiones Previas
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {profileData?.previous_injuries || "Ninguna"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Condiciones Médicas
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {profileData?.medical_conditions || "Ninguna"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit("medical")}
                        className="ml-4 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Entrenamiento y Objetivos */}
          <div className="bg-white dark:bg-surface-dark/50 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection("training")}
              className="w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-surface-dark transition-colors"
              disabled={editingSection !== null}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/10 text-green-500 mr-4 shrink-0">
                <span className="material-symbols-outlined">
                  fitness_center
                </span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-base font-semibold text-[#101418] dark:text-white">
                  Entrenamiento y Objetivos
                </h3>
                <p className="text-sm text-gray-500">
                  Experiencia y metas deportivas
                </p>
              </div>
              <span
                className={cn(
                  "material-symbols-outlined text-gray-400 transition-transform",
                  expandedSection === "training" && "rotate-180",
                )}
              >
                expand_more
              </span>
            </button>

            {expandedSection === "training" && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-800">
                {editingSection === "training" ? (
                  <>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nivel de Actividad
                      </label>
                      <select
                        value={formData.activity_level || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            activity_level: e.target
                              .value as StudentProfileData["activity_level"],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="sedentary">Sedentario</option>
                        <option value="light">Ligero</option>
                        <option value="moderate">Moderado</option>
                        <option value="active">Activo</option>
                        <option value="very_active">Muy Activo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Objetivo Principal
                      </label>
                      <select
                        value={formData.primary_goal || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primary_goal: e.target
                              .value as StudentProfileData["primary_goal"],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="aesthetic">Estética</option>
                        <option value="sports">Deportivo</option>
                        <option value="health">Salud</option>
                        <option value="rehabilitation">Rehabilitación</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Experiencia en Entrenamiento
                      </label>
                      <select
                        value={formData.training_experience || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            training_experience: e.target
                              .value as StudentProfileData["training_experience"],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="none">Ninguna</option>
                        <option value="beginner">Principiante</option>
                        <option value="intermediate">Intermedio</option>
                        <option value="advanced">Avanzado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Deportes Practicados
                      </label>
                      <input
                        type="text"
                        value={formData.sports || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, sports: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Ej: Fútbol, natación..."
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSave("training")}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start pt-3">
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Nivel de Actividad
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {profileData?.activity_level
                              ? translateActivityLevel(
                                  profileData.activity_level,
                                )
                              : "No especificado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Objetivo Principal
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {profileData?.primary_goal
                              ? translateGoal(profileData.primary_goal)
                              : "No especificado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Experiencia
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {profileData?.training_experience
                              ? translateExperience(
                                  profileData.training_experience,
                                )
                              : "No especificado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Deportes
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {profileData?.sports || "No especificado"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit("training")}
                        className="ml-4 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="pt-4">
            <div
              onClick={handleLogout}
              className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-transparent text-red-500 mr-4 shrink-0">
                <span className="material-symbols-outlined">logout</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-red-600 dark:text-red-400">
                  Cerrar Sesión
                </h3>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
