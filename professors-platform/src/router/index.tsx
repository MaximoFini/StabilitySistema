import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { RequireRole } from "@/components/layout/RequireRole";

// ── Lazy page imports (code splitting) ────────────────────────────────────
const MainLayout = lazy(() => import("@/components/layout/MainLayout"));
const RoleBasedDashboard = lazy(
  () => import("@/features/dashboard/RoleBasedDashboard"),
);
const Login = lazy(() => import("@/features/auth/Login"));
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage"));
const StudentRegister = lazy(() => import("@/features/auth/StudentRegister"));
const StudentProfileSetup = lazy(
  () => import("@/features/auth/StudentProfileSetup"),
);
const StudentsList = lazy(() => import("@/features/students/StudentsList"));
const BusinessMetrics = lazy(
  () => import("@/features/metrics/BusinessMetrics"),
);
const Library = lazy(() => import("@/features/library/Library"));
const NewPlan = lazy(() => import("@/features/plans/NewPlan"));
const TrainingLayout = lazy(() => import("@/features/training/TrainingLayout"));
const TrainingHome = lazy(() => import("@/features/training/TrainingHome"));
const ExerciseList = lazy(() => import("@/features/training/ExerciseList"));
const ExerciseDetail = lazy(() => import("@/features/training/ExerciseDetail"));
const WorkoutComplete = lazy(
  () => import("@/features/training/WorkoutComplete"),
);
const TrainingProgress = lazy(() =>
  import("@/features/training/TrainingProgress").then((m) => ({
    default: m.TrainingProgress,
  })),
);
const TrainingProfile = lazy(() =>
  import("@/features/training/TrainingProfile").then((m) => ({
    default: m.TrainingProfile,
  })),
);

// ── Suspense helpers ───────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">
        progress_activity
      </span>
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  // ── Coach routes (sidebar layout) ──────────────────────────────────────
  {
    path: "/",
    element: (
      <RequireAuth>
        <RequireRole role="coach">
          <Suspense fallback={<PageSkeleton />}>
            <MainLayout />
          </Suspense>
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      {
        path: "/",
        element: withSuspense(RoleBasedDashboard),
      },
      {
        path: "inicio",
        element: withSuspense(StudentsList),
      },
      {
        path: "dashboard",
        element: withSuspense(BusinessMetrics),
      },
      {
        path: "biblioteca",
        element: withSuspense(Library),
      },
      {
        path: "planificador",
        element: withSuspense(NewPlan),
      },
    ],
  },

  // ── Student training routes (mobile layout with bottom nav) ─────────────
  {
    path: "/entrenamiento",
    element: (
      <RequireAuth>
        <RequireRole role="student">
          <Suspense fallback={<PageSkeleton />}>
            <TrainingLayout />
          </Suspense>
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true, element: withSuspense(TrainingHome) },
      { path: "progreso", element: withSuspense(TrainingProgress) },
      { path: "perfil", element: withSuspense(TrainingProfile) },
    ],
  },
  // Workout flow — full-screen, no bottom nav
  {
    path: "/entrenamiento/dia/:dayId",
    element: <RequireAuth>{withSuspense(ExerciseList)}</RequireAuth>,
  },
  {
    path: "/entrenamiento/dia/:dayId/ejercicio/:exerciseNum",
    element: <RequireAuth>{withSuspense(ExerciseDetail)}</RequireAuth>,
  },
  {
    path: "/entrenamiento/completado",
    element: <RequireAuth>{withSuspense(WorkoutComplete)}</RequireAuth>,
  },

  // ── Auth routes ────────────────────────────────────────────────────────
  {
    path: "/login",
    element: withSuspense(Login),
  },
  {
    path: "/register",
    element: withSuspense(RegisterPage),
  },
  {
    path: "/register/student",
    element: withSuspense(StudentRegister),
  },
  {
    path: "/register/complete-profile",
    element: <RequireAuth>{withSuspense(StudentProfileSetup)}</RequireAuth>,
  },
]);
