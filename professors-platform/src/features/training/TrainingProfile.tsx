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

      // Excluir columnas generadas por la DB (ej: bmi) que no se pueden actualizar manualmente
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { bmi, ...updateData } = formData as Record<string, unknown>;

      const { error } = await supabase
        .from("student_profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      setProfileData({ ...profileData, ...updateData } as StudentProfileData);
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
    <div className="bg-background-light dark:bg-background-dark font-display text-[#1F2937] dark:text-gray-100 flex flex-col">
      <header className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8"></div>
        <h2 className="text-lg font-bold">Perfil</h2>
        <div className="w-8"></div>
      </header>

      <div className="pb-24">
        {/* Profile Header */}
        <div className="relative pt-10 pb-8 px-4 flex flex-col items-center overflow-hidden">
          {/* Decorative Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 dark:bg-primary/10 blur-[100px] -z-10 rounded-full" />

          <div className="relative group">
            <div
              className="w-28 h-28 rounded-full shadow-2xl border-4 border-white dark:border-slate-800 relative z-10 overflow-hidden ring-4 ring-primary/5 transition-transform duration-500 group-hover:scale-[1.02]"
              style={{
                backgroundImage: professor?.profileImage
                  ? `url("${professor.profileImage}")`
                  : `url("https://ui-avatars.com/api/?name=${professor?.firstName}+${professor?.lastName}&size=256&background=0056B2&color=fff&bold=true")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-20" />
          </div>

          <div className="mt-5 text-center">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {professor?.firstName} {professor?.lastName}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">
                Alumno Stability
              </p>
            </div>
          </div>
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
              <div className="px-5 pb-6 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                {editingSection === "personal" ? (
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={formData.phone || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
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
                          className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                          placeholder="@usuario"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
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
                          className="block w-full min-w-full appearance-none px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
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
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                        >
                          <option value="male">Masculino</option>
                          <option value="female">Femenino</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleSave("personal")}
                        className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all"
                      >
                        Actualizar Datos
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-4">
                      {/* Phone */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 a dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400 filled">call</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Teléfono</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {profileData?.phone || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Instagram */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px] text-pink-500 filled">alternate_email</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Instagram</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {profileData?.instagram || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Birthday */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px] text-blue-500 filled">cake</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nacimiento</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {profileData?.birth_date
                              ? new Date(profileData.birth_date).toLocaleDateString("es-ES")
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px] text-violet-500 filled">wc</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Género</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {profileData?.gender ? translateGender(profileData.gender) : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEdit("personal")}
                      className="w-full mt-8 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold text-primary hover:bg-primary/5 active:scale-[0.98] transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      EDITAR INFORMACIÓN
                    </button>
                  </div>
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
              <div className="px-5 pb-6 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                {editingSection === "medical" ? (
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
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
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                        rows={3}
                        placeholder="Describe lesiones previas..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
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
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                        rows={3}
                        placeholder="Condiciones médicas relevantes..."
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleSave("medical")}
                        className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all"
                      >
                        Actualizar Datos
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 space-y-4">
                    <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-orange-500 text-[18px] filled">warning</span>
                        <p className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Lesiones Previas</p>
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {profileData?.previous_injuries || "No se han registrado lesiones."}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-blue-500 text-[18px] filled">medical_information</span>
                        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Condiciones Médicas</p>
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {profileData?.medical_conditions || "Sin condiciones médicas reportadas."}
                      </p>
                    </div>

                    <button
                      onClick={() => handleEdit("medical")}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold text-primary hover:bg-primary/5 active:scale-[0.98] transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      EDITAR INFORMACIÓN MÉDICA
                    </button>
                  </div>
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
              <div className="px-5 pb-6 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                {editingSection === "training" ? (
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
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
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                        >
                          <option value="sedentary">Sedentario</option>
                          <option value="light">Ligero</option>
                          <option value="moderate">Moderado</option>
                          <option value="active">Activo</option>
                          <option value="very_active">Muy Activo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
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
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                        >
                          <option value="aesthetic">Estética</option>
                          <option value="sports">Deportivo</option>
                          <option value="health">Salud</option>
                          <option value="rehabilitation">Rehabilitación</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
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
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                        >
                          <option value="none">Ninguna</option>
                          <option value="beginner">Principiante</option>
                          <option value="intermediate">Intermedio</option>
                          <option value="advanced">Avanzado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                          Deportes Practicados
                        </label>
                        <input
                          type="text"
                          value={formData.sports || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, sports: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                          placeholder="Ej: Fútbol, natación..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleSave("training")}
                        className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all"
                      >
                        Actualizar Datos
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <div className="grid grid-cols-1 gap-4 pt-2">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[20px] filled">bolt</span>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nivel Actividad</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {profileData?.activity_level ? translateActivityLevel(profileData.activity_level) : "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                            <span className="material-symbols-outlined text-[20px] filled">target</span>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Objetivo</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {profileData?.primary_goal ? translateGoal(profileData.primary_goal) : "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                            <span className="material-symbols-outlined text-[20px] filled">military_tech</span>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Experiencia</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {profileData?.training_experience ? translateExperience(profileData.training_experience) : "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary text-[18px] filled">sports_basketball</span>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deportes Practicados</p>
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {profileData?.sports || "No se especificaron deportes."}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEdit("training")}
                      className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold text-primary hover:bg-primary/5 active:scale-[0.98] transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      EDITAR ENTRENAMIENTO
                    </button>
                  </div>
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
      </div>
    </div>
  );
}
