import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useStudentProfile,
  calculateAge,
  GOAL_LABELS,
  EXPERIENCE_LABELS,
  ACTIVITY_LABELS,
  GENDER_LABELS,
  PLAN_STATUS_LABELS,
} from "@/hooks/useStudentProfile";
import type { StudentProfile as StudentProfileType, AssignedPlan } from "@/hooks/useStudentProfile";

// ── Skeleton ───────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-pulse">
      <header className="h-20 bg-white dark:bg-card-dark border-b border-gray-100 dark:border-gray-800 hidden md:flex items-center px-8">
        <div className="h-4 bg-gray-200 rounded w-40" />
      </header>
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white dark:bg-card-dark rounded-2xl p-8 flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gray-200" />
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-card-dark rounded-xl p-4 h-20">
                <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-5 bg-gray-200 rounded w-12" />
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-card-dark rounded-2xl p-8 h-64" />
        </div>
      </main>
    </div>
  );
}

// ── Tab type ───────────────────────────────────────────────────────────────

type TabKey = "general" | "historial" | "progreso";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "general", label: "General & Antropometría", icon: "person" },
  { key: "historial", label: "Historial", icon: "history" },
  { key: "progreso", label: "Progreso", icon: "monitoring" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (!cleaned.startsWith("54")) {
    if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
    cleaned = "549" + cleaned;
  }
  return cleaned;
}

function formatInstagramUsername(instagram: string): string {
  return instagram.replace(/^@/, "").trim();
}

// ── Inline SVG icons ───────────────────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

// ── Info row helper ────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="material-symbols-outlined text-gray-400 text-[20px] mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 break-words">
          {value || <span className="text-gray-400 font-normal italic">Sin especificar</span>}
        </p>
      </div>
    </div>
  );
}

// ── Contact row (with action button) ──────────────────────────────────────

function PhoneRow({ phone }: { phone: string | null }) {
  if (!phone) return <InfoRow icon="phone" label="Teléfono" value={null} />;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
      <span className="material-symbols-outlined text-gray-400 text-[20px] mt-0.5">phone</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</p>
        <div className="flex flex-wrap items-center gap-3 mt-0.5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{phone}</p>
          <button
            onClick={() =>
              window.open(
                `https://wa.me/${formatPhoneForWhatsApp(phone)}?text=Hola!`,
                "_blank",
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "#25D366" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#20BA5A")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#25D366")}
          >
            <WhatsAppIcon />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

function InstagramRow({ instagram }: { instagram: string | null }) {
  if (!instagram) return <InfoRow icon="link" label="Instagram" value={null} />;
  const username = formatInstagramUsername(instagram);
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="material-symbols-outlined text-gray-400 text-[20px] mt-0.5">link</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Instagram</p>
        <div className="flex flex-wrap items-center gap-3 mt-0.5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">@{username}</p>
          <button
            onClick={() =>
              window.open(`https://instagram.com/${username}`, "_blank")
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #E1306C 0%, #F56040 100%)",
            }}
          >
            <InstagramIcon />
            Instagram
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, unit }: { icon: string; label: string; value: string | number | null; unit?: string }) {
  return (
    <div className="bg-white dark:bg-card-dark rounded-xl p-4 shadow-card border border-gray-200 dark:border-gray-700 text-center">
      <span className="material-symbols-outlined text-primary text-[22px] mb-1 block">{icon}</span>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
        {value != null ? (
          <>
            {value}
            {unit && <span className="text-sm font-medium text-gray-500 ml-1">{unit}</span>}
          </>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </p>
    </div>
  );
}

// ── General tab ────────────────────────────────────────────────────────────

function GeneralTab({ student }: { student: StudentProfileType }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Info */}
      <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-card border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
          Información Personal
        </h3>
        <InfoRow icon="email" label="Email" value={student.email} />
        <PhoneRow phone={student.phone} />
        <InfoRow
          icon="cake"
          label="Fecha de Nacimiento"
          value={
            student.birthDate
              ? `${new Date(student.birthDate).toLocaleDateString("es-AR")} (${calculateAge(student.birthDate)} años)`
              : null
          }
        />
        <InfoRow icon="wc" label="Género" value={student.gender ? GENDER_LABELS[student.gender] : null} />
        <InfoRow
          icon="calendar_today"
          label="Miembro desde"
          value={new Date(student.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}
        />
        <InstagramRow instagram={student.instagram} />
      </div>

      {/* Training & Goals */}
      <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-card border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">fitness_center</span>
          Entrenamiento y Objetivos
        </h3>
        <InfoRow
          icon="flag"
          label="Objetivo Principal"
          value={student.primaryGoal ? GOAL_LABELS[student.primaryGoal] : null}
        />
        <InfoRow
          icon="trending_up"
          label="Nivel de Experiencia"
          value={student.trainingExperience ? EXPERIENCE_LABELS[student.trainingExperience] : null}
        />
        <InfoRow
          icon="directions_run"
          label="Nivel de Actividad"
          value={student.activityLevel ? ACTIVITY_LABELS[student.activityLevel] : null}
        />
        <InfoRow icon="sports" label="Deportes" value={student.sports} />
        <InfoRow icon="healing" label="Lesiones Previas" value={student.previousInjuries} />
        <InfoRow icon="medical_information" label="Condiciones Médicas" value={student.medicalConditions} />
      </div>
    </div>
  );
}

// ── Historial tab ──────────────────────────────────────────────────────────

function HistorialTab({ plans }: { plans: AssignedPlan[] }) {
  if (plans.length === 0) {
    return (
      <div className="bg-white dark:bg-card-dark rounded-2xl p-12 shadow-card border border-gray-200 dark:border-gray-700 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">
          assignment
        </span>
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Sin planificaciones asignadas</h3>
        <p className="text-sm text-gray-500">
          Este alumno no tiene planes de entrenamiento asignados aún.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">toc</span>
        Historial de Planificaciones
      </h3>
      {plans.map((plan) => {
        const statusColor =
          plan.status === "active"
            ? "bg-green-50 text-green-700 border-green-200"
            : plan.status === "completed"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : plan.status === "paused"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : "bg-gray-50 text-gray-700 border-gray-200";

        const progress = plan.totalDays > 0 ? Math.round((plan.completedDays / plan.totalDays) * 100) : 0;

        return (
          <div
            key={plan.id}
            className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-card border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">{plan.planTitle}</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {plan.daysPerWeek} días/semana • {plan.totalWeeks} semanas
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColor}`}>
                {PLAN_STATUS_LABELS[plan.status] || plan.status}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Día {plan.currentDayNumber} de {plan.totalDays}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                {new Date(plan.startDate).toLocaleDateString("es-AR")}
              </span>
              <span>→</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">event</span>
                {new Date(plan.endDate).toLocaleDateString("es-AR")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Progreso tab ───────────────────────────────────────────────────────────

function ProgresoTab() {
  return (
    <div className="space-y-6">
      {/* Body evolution placeholder */}
      <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-card border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">monitor_weight</span>
          Evolución Corporal
        </h3>
        <p className="text-sm text-gray-500 mb-6">Historial de peso corporal</p>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
            show_chart
          </span>
          <h4 className="text-base font-bold text-gray-600 dark:text-gray-400 mb-1">Próximamente</h4>
          <p className="text-sm text-gray-400">
            Los gráficos de evolución estarán disponibles cuando se registren mediciones corporales.
          </p>
        </div>
      </div>

      {/* Strength progress placeholder */}
      <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-card border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">fitness_center</span>
          Rendimiento y Fuerza
        </h3>
        <p className="text-sm text-gray-500 mb-6">Progreso de Marcas Personales (PR)</p>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
            emoji_events
          </span>
          <h4 className="text-base font-bold text-gray-600 dark:text-gray-400 mb-1">Próximamente</h4>
          <p className="text-sm text-gray-400">
            Las marcas personales estarán disponibles cuando se registren entrenamientos completados.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { student, plans, isLoading, error } = useStudentProfile(studentId);
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  if (isLoading) return <ProfileSkeleton />;

  if (error || !student) {
    return (
      <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
        <header className="h-20 bg-white dark:bg-card-dark border-b border-gray-100 dark:border-gray-800 hidden md:flex items-center px-8">
          <button
            onClick={() => navigate("/inicio")}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Volver a Mis Alumnos
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-red-300 mb-4 block">error</span>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {error || "Alumno no encontrado"}
            </h2>
            <button
              onClick={() => navigate("/inicio")}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </main>
      </div>
    );
  }

  const avatarUrl =
    student.profileImageUrl || student.profileImage || null;

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="h-20 bg-white dark:bg-card-dark border-b border-gray-100 dark:border-gray-800 hidden md:flex items-center justify-between px-8 z-10 flex-shrink-0">
        <button
          onClick={() => navigate("/inicio")}
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Volver a Mis Alumnos
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Perfil de Alumno</h2>
        <div className="w-40" /> {/* spacer for centering */}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Student Card */}
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 md:p-8 shadow-card border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="h-24 w-24 rounded-full bg-gray-200 bg-cover bg-center ring-4 ring-blue-50 dark:ring-gray-700 shadow-md"
                  style={{
                    backgroundImage: avatarUrl
                      ? `url('${avatarUrl}')`
                      : "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22system-ui%22 font-size=%2236%22 fill=%22%239ca3af%22%3E" +
                        (student.firstName?.[0]?.toUpperCase() || "?") +
                        "%3C/text%3E%3C/svg%3E')",
                  }}
                />
              </div>

              {/* Info */}
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{student.fullName}</h1>
                {student.primaryGoal && (
                  <span className="inline-flex items-center mt-2 text-xs font-bold text-primary bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                    <span className="material-symbols-outlined text-[14px] mr-1">flag</span>
                    {GOAL_LABELS[student.primaryGoal] || student.primaryGoal}
                  </span>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Miembro desde{" "}
                  {new Date(student.createdAt).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Physical Data Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="height" label="Altura" value={student.heightCm} unit="cm" />
            <StatCard icon="monitor_weight" label="Peso" value={student.weightKg ? Number(student.weightKg).toFixed(1) : null} unit="kg" />
            <StatCard icon="speed" label="IMC" value={student.bmi ? Number(student.bmi).toFixed(1) : null} />
            <StatCard
              icon="cake"
              label="Edad"
              value={student.birthDate ? calculateAge(student.birthDate) : null}
              unit="años"
            />
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-card border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                    activeTab === tab.key
                      ? "text-primary border-primary bg-blue-50/50 dark:bg-blue-900/10"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "general" && <GeneralTab student={student} />}
              {activeTab === "historial" && <HistorialTab plans={plans} />}
              {activeTab === "progreso" && <ProgresoTab />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
