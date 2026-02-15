import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

// Mock Data
const MOCK_PLANS = [
    {
        id: 1,
        title: "Hipertrofia Fase 1",
        weeks: 4,
        daysPerWeek: 3,
        type: "Hipertrofia",
        assignedCount: 12,
        assignedAvatars: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCjyWSyr8nHP8CVPUTd7hfLd1S4h7bAqWDvv54UO0Nwg2URKLKRFcGhxYaw4miTIM_44853PYlKyKX0MvYzFIyoO0bIdmZESfL09tML85lQIqH3c7U9s5cX0JLY31Y49E4RvO2BavEzPtakPdnSWDqPxJAZr-DiJrB7AH5Q3yrIyVe9Iz1nU--8sg-PA12JDryh9QQcyiyfZfY4fU7ngN193SPR3MZi5nhu-EWprB4u1oC-jG11MW7H97k4QWpVRXFeNRlfBnHEj39k",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBNcgHvk_8h5XeWb9tMaC-Kj0rPaL0El8TUGirXYc3XBIfzS3U9qQyTTYRcRVoXVfZyP1vhOaCpdTNStrpp2HMaMbJgC69QjM1_KpuOQbT4mZoBbAmpeMqRt0J-GE6CjaXQqEWEDsEGBHarGVMsUM3TatGMemEsalfLHAqmuuaivKuey0umGAkX6fG9sQzFINcMnAP1Gy1ADSdg_W4rkql9ccGlviX51LG3CnxarE9KLhKbZKMd21IwuvaENthYZ_BS0GY0aeOcc9Xw",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAXR8DvpA9uwYeeGvC4PLOB84Mhi6SxodjMxZ2exfsPO7-Vzb66fS7bNPdSSDud_2TVYt2CthlZ1G3ws9UxBcS9g_Aiyfqejd-c4Ox1hhL17-aOESDy1MkKOKoiuZPpDuXfN-_JjOmpELfyugUgA7WWlAFE3lcw4gyaw1xpSjZcE64Td-RmMyQTw7dPnCQtN7UgH66mMyWS1svDGXnzgEIdCZtGrhTumfMSqSTKGrPXaSZaXUX1SMNmXrtxEgVZr0o6L50ZAmR9QPpt"
        ]
    },
    {
        id: 2,
        title: "Fuerza Básica",
        weeks: 6,
        daysPerWeek: 4,
        type: "Fuerza",
        assignedCount: 5,
        assignedAvatars: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCDQ0fKyb5OZi1vRDWpbrHgzWjkwJbJWuAn2dzjmp1uazaEBxqWc8cLsMMLGZ95Ihz5QnHThXn1Tt2a_ppCfXi6e2PuLb5RPjdQFmjYQrbbNk1S-CBdyyiDTF0sptX_07hjPHYd12Wa6kU9VMw-zvL3m6BhV_PrLA22hqzfzqLb8Qc5ReomOpbcJhkveFgUQPEfZNnOwidqx_GrFXhJPRuqHa9TdxLbwF-2tdupEo8W8wakoRQTstspTKCEduZTbM4VQRrKI1Zwid3f",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ4Wm7fRFyDmW-zbhajBwjcMbUyCqFQDkVlwur1l_9n2AkBmCmM-J7T8_Esx-HlHySjeT6fCkWMJCmJ1pwH0fxGnrXgGdF2r8qNfa9Xg2LbDG7iGjMY-WfKtdZ6BDK1lXJUWWjfRyxbEa8b24u2W4paDLv8pqU4FsP9znHPFvbMQrl3MOczs0RmazDHikIqd02XwPJP12ua6WbB1G5O_oO7A0_E573cGbWBNSqXq1pq96lHoE9yhx204hZCsQvWOGYHyDQUctYRNol"
        ]
    },
    {
        id: 3,
        title: "Movilidad de Cadera",
        weeks: 2,
        daysPerWeek: 7,
        type: "Movilidad",
        assignedCount: 0,
        assignedAvatars: []
    },
    {
        id: 4,
        title: "Rehabilitación ACL",
        weeks: 12,
        daysPerWeek: 3,
        type: "Rehabilitación",
        assignedCount: 1,
        assignedAvatars: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDHppwwwhmnQAmX1-OjeqUQ1qLcmqRWrRHno2h1K_Fql7Cjd2N9k-V3mMHKPV4VV1ZPfi0fxEyQyRxnywUDhAK8TurlZZqoAq9aGPNzLTcWBCsugguLrETiBk1b24ncBobZSwcw8SIaEVcUWQtSRRvxbdj2e31h16n1DOKVmHiIsERp-3nKnk6gDUoFrsRsALHdKUa76fQHxyonwwSFiIM7aPnQCzB6yLUOPFPVJqLqkKVhO0H3hwBBwsMdlhxAx9FSyhwvGaB6gYoq"
        ]
    },
]

export default function RoutineList({ searchQuery }: { searchQuery: string }) {
    const navigate = useNavigate()
    const [plans, setPlans] = useState(MOCK_PLANS)
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)

    // Filter Logic
    const filteredPlans = plans.filter(plan => 
        plan.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Handlers
    const handleCardClick = (id: number) => {
        navigate(`/planificador?planId=${id}&mode=edit`)
    }

    const handleMenuAction = (e: React.MouseEvent, action: string, planId: number) => {
        e.stopPropagation()
        setOpenMenuId(null)
        
        switch(action) {
            case 'edit':
                navigate(`/planificador?planId=${planId}&mode=edit`)
                break
            case 'duplicate':
                const planToStart = plans.find(p => p.id === planId)
                if (planToStart) {
                    const newPlan = { ...planToStart, id: Date.now(), title: `${planToStart.title} (Copia)`, assignedCount: 0, assignedAvatars: [] }
                    setPlans([...plans, newPlan])
                    toast.success("Plan duplicado correctamente")
                }
                break
            case 'delete':
                if (window.confirm("¿Seguro que quieres eliminar este plan?")) {
                    setPlans(plans.filter(p => p.id !== planId))
                    toast.success("Plan eliminado")
                }
                break
            case 'assign':
                toast.info("Abriendo selector de alumnos...")
                break
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {filteredPlans.map((plan) => (
                <article 
                    key={plan.id}
                    onClick={() => handleCardClick(plan.id)}
                    className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-shadow duration-200 flex flex-col group h-full cursor-pointer relative"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{plan.title}</h3>
                        <div className="relative">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenMenuId(openMenuId === plan.id ? null : plan.id)
                                }}
                                className="h-8 w-8 -mr-2 -mt-2 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors"
                            >
                                <span className="material-symbols-outlined">more_vert</span>
                            </button>
                            
                            {/* Custom Dropdown */}
                            {openMenuId === plan.id && (
                                <div className="absolute right-0 top-8 z-10 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                                    <button onClick={(e) => handleMenuAction(e, 'edit', plan.id)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Editar plan</button>
                                    <button onClick={(e) => handleMenuAction(e, 'duplicate', plan.id)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Duplicar plan</button>
                                    <button onClick={(e) => handleMenuAction(e, 'assign', plan.id)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Asignar a alumno</button>
                                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                                    <button onClick={(e) => handleMenuAction(e, 'delete', plan.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Eliminar plan</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 mb-6 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {plan.weeks} Semanas
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-600">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {plan.daysPerWeek} Días/Sem
                        </span>
                         {/* Type Badge */}
                         {plan.type && (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-600">
                                {plan.type}
                            </span>
                        )}
                    </div>

                    <div className="mt-auto border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Asignado a:</span>
                        <div className="flex items-center -space-x-2">
                             {plan.assignedCount === 0 ? (
                                <div className="flex items-center text-slate-400">
                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                                    </div>
                                    <span className="ml-2 text-xs">Sin asignar</span>
                                </div>
                             ) : (
                                <>
                                    {plan.assignedAvatars.slice(0, 3).map((avatar, i) => (
                                        <img key={i} alt="User" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" src={avatar} />
                                    ))}
                                    {plan.assignedCount > 3 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                            +{plan.assignedCount - 3}
                                        </div>
                                    )}
                                </>
                             )}
                        </div>
                    </div>
                </article>
            ))}
             {/* Fallback for empty search */}
             {filteredPlans.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                    No se encontraron rutinas que coincidan con tu búsqueda.
                </div>
            )}
        </div>
    )
}
