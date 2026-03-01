import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTrainingPlans } from "../../hooks/useTrainingPlans";
import { useExportPlanPDF } from "../../hooks/useExportPlanPDF";
import PlanPreview from "./PlanPreview";
import PlanPDFTemplate from "./components/PlanPDFTemplate";
import AssignedStudentsModal from "../../components/AssignedStudentsModal";
import AssignPlanModal from "../../components/AssignPlanModal";
import ConfirmActionModal from "../../components/ConfirmActionModal";

export default function RoutineList({ searchQuery }: { searchQuery: string }) {
  const navigate = useNavigate();
  const { plans, loading, deletePlan, duplicatePlan, assignPlanToStudents } =
    useTrainingPlans();
  const { exportPDF, isExporting, templateRef, pdfData } = useExportPlanPDF();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPlanToAssign, setSelectedPlanToAssign] = useState<{
    id: string;
    title: string;
    start_date: string;
    end_date: string;
  } | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedModalPlan, setAssignedModalPlan] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [planToDelete, setPlanToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Filter Logic
  const filteredPlans = plans.filter((plan) =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handlers
  const handleCardClick = (id: string) => {
    setSelectedPlanId(id);
  };

  const handleMenuAction = async (
    e: React.MouseEvent,
    action: string,
    plan: any,
  ) => {
    e.stopPropagation();
    setOpenMenuId(null);

    switch (action) {
      case "edit":
        navigate(`/planificador?planId=${plan.id}&mode=edit`);
        break;
      case "duplicate":
        toast.promise(duplicatePlan(plan.id), {
          loading: "Duplicando plan...",
          success: (result) => {
            if (result.success) {
              return "Plan duplicado exitosamente";
            }
            throw new Error(result.error || "Error al duplicar");
          },
          error: (err) => err.message || "Error al duplicar plan",
        });
        break;
      case "delete":
        setPlanToDelete(plan);
        break;
      case "assign":
        setSelectedPlanToAssign(plan as any);
        setIsAssignModalOpen(true);
        break;
      case "viewStudents":
        setAssignedModalPlan(plan);
        break;
      case "exportPDF":
        toast.promise(exportPDF(plan.id), {
          loading: "Generando PDF...",
          success: "PDF descargado correctamente",
          error: "Error al generar el PDF",
        });
        break;
    }
  };

  const handleAvatarClick = (e: React.MouseEvent, plan: any) => {
    e.stopPropagation();
    setAssignedModalPlan(plan);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Cargando planes...
          </p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (filteredPlans.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
            folder_open
          </span>
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            {searchQuery
              ? "No se encontraron planes"
              : "No hay planes guardados"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            {searchQuery
              ? "Intenta con otros términos de búsqueda"
              : "Crea planes desde el Planificador"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {filteredPlans.map((plan) => (
          <article
            key={plan.id}
            onClick={() => handleCardClick(plan.id)}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-shadow duration-200 flex flex-col group h-full cursor-pointer relative"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {plan.title}
              </h3>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === plan.id ? null : plan.id);
                  }}
                  className="h-8 w-8 -mr-2 -mt-2 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>

                {/* Custom Dropdown */}
                {openMenuId === plan.id && (
                  <div className="absolute right-0 top-8 z-10 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                    <button
                      onClick={(e) => handleMenuAction(e, "edit", plan)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        edit
                      </span>
                      Editar plan
                    </button>
                    <button
                      onClick={(e) => handleMenuAction(e, "duplicate", plan)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        content_copy
                      </span>
                      Duplicar plan
                    </button>
                    <button
                      onClick={(e) => handleMenuAction(e, "viewStudents", plan)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        group
                      </span>
                      Ver alumnos asignados
                    </button>
                    <button
                      onClick={(e) => handleMenuAction(e, "assign", plan)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        person_add
                      </span>
                      Asignar a alumno
                    </button>
                    <button
                      onClick={(e) => handleMenuAction(e, "exportPDF", plan)}
                      disabled={isExporting}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExporting ? (
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">
                          picture_as_pdf
                        </span>
                      )}
                      Exportar a PDF
                    </button>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                    <button
                      onClick={(e) => handleMenuAction(e, "delete", plan)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                      Eliminar plan
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800">
                <span className="material-symbols-outlined text-[14px]">
                  schedule
                </span>
                {plan.total_weeks}{" "}
                {plan.total_weeks === 1 ? "Semana" : "Semanas"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-600">
                <span className="material-symbols-outlined text-[14px]">
                  calendar_today
                </span>
                {plan.days_per_week} Días/Sem
              </span>
            </div>

            <div className="mt-auto border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Asignado a:
              </span>
              <div className="flex items-center gap-2">
                {plan.assignedCount === 0 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlanToAssign(plan);
                      setIsAssignModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">
                        person_add
                      </span>
                    </div>
                    <span className="text-xs font-medium">Asignar</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleAvatarClick(e, plan)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    title="Ver alumnos asignados"
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-white">
                        group
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {plan.assignedCount}{" "}
                      {plan.assignedCount === 1 ? "alumno" : "alumnos"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Plan Preview Modal */}
      {selectedPlanId && (
        <PlanPreview
          planId={selectedPlanId}
          onClose={() => setSelectedPlanId(null)}
        />
      )}

      {/* Hidden PDF template — rendered off-screen for html2canvas capture */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        {pdfData && <PlanPDFTemplate ref={templateRef} data={pdfData} />}
      </div>

      {/* Assigned Students Modal */}
      {assignedModalPlan && (
        <AssignedStudentsModal
          isOpen={true}
          onClose={() => setAssignedModalPlan(null)}
          planId={assignedModalPlan.id}
          planTitle={assignedModalPlan.title}
        />
      )}

      {/* Assign Plan Modal */}
      <AssignPlanModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={async (studentIds) => {
          if (!selectedPlanToAssign) return;
          setIsAssigning(true);
          try {
            const result = await assignPlanToStudents(
              selectedPlanToAssign.id,
              studentIds,
              new Date(selectedPlanToAssign.start_date),
              new Date(selectedPlanToAssign.end_date),
            );
            if (result?.success) {
              toast.success("Plan asignado correctamente");
              setIsAssignModalOpen(false);
            } else {
              toast.error(result?.error || "Error al asignar plan");
            }
          } catch (err) {
            toast.error("Error al asignar plan");
          } finally {
            setIsAssigning(false);
          }
        }}
        isSubmitting={isAssigning}
        planTitle={selectedPlanToAssign?.title}
        planStartDate={
          selectedPlanToAssign
            ? new Date(selectedPlanToAssign.start_date)
            : undefined
        }
        planEndDate={
          selectedPlanToAssign
            ? new Date(selectedPlanToAssign.end_date)
            : undefined
        }
      />

      {planToDelete && (
        <ConfirmActionModal
          isOpen={!!planToDelete}
          onClose={() => setPlanToDelete(null)}
          onConfirm={async () => {
            const result = await deletePlan(planToDelete.id);
            if (result.success) {
              toast.success("Plan eliminado");
            } else {
              toast.error(`Error al eliminar: ${result.error}`);
            }
          }}
          title="¿Eliminar plan?"
          description={`¿Estás seguro que quieres eliminar el plan "${planToDelete.title}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar Plan"
        />
      )}
    </>
  );
}
