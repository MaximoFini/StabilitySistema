

export default function StudentsList() {
    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark relative">
            <header className="h-20 bg-white dark:bg-card-dark border-b border-gray-100 dark:border-gray-800 hidden md:flex items-center justify-between px-8 z-10 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inicio</h2>
                <div className="flex items-center gap-6">
                    <div className="h-10 w-10 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm cursor-pointer hover:ring-2 ring-primary ring-offset-2 transition-all" data-alt="Coach profile picture" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqcu8MmoySDYMncJpwpcC79mTV-KGJvTEZOAB1KXSGUKBzavr03LhdG6lQYsoHR9pTlFNj5Xgw29yhdTNnh0ikoerlh8e4j9KugKm7kiKqrEauH7VdWFt6z-I-JNXmXW79cQV6AjyjVIXARiAdNgmRsJ50CnUc3L-dTfaXpPGMmTxeisQ1Y9P7j0olzGy0LlhIwYXHMPqOIl9MzrncoeOEFxTlDYeJtLSbMd7cWXemVoE8bbpct1sxWc_04HG9xANh6z0Ee0224SP5')" }}>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8 lg:p-12">
                <div className="max-w-7xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Mis Alumnos</h2>
                        </div>
                        <p className="text-secondary text-sm md:text-base">Gestiona los programas de entrenamiento y monitorea el progreso.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <div className="group bg-white dark:bg-card-dark rounded-2xl p-8 shadow-card hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 flex flex-col items-center text-center cursor-pointer">
                            <div className="relative mb-4">
                                <div className="h-24 w-24 rounded-full bg-gray-200 bg-cover bg-center ring-4 ring-gray-50 dark:ring-gray-800 shadow-sm group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMcksh0JqNeLkjB0_X0EQjA7L1Q14wnE73MzyEULusuSbXGFGw1GJUM7HQO0pyHQWq7lS3b091YNNkO6D_2K9AXiOyYWAmCcEp1-svnL7X__jSjlKINhmI005zIdpkTjeeV4Jou5FIO3FyTCyU3N1Om-bePvdPnrp3gEE7DVKLXeSbvmy9tbKV5me5TKSCQaxeAkhtT_iUUpuyard73iL4i3ZJJaJLDG0PZpSRg6QtJMNLiPrzxf45Ao8iSIReb8hH5IAufkLMFFHS')" }}></div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Juan Pérez</h3>
                            <p className="text-sm text-secondary font-medium mb-6 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">Intermedio • Hipertrofia</p>
                            <button className="w-full mt-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary dark:text-blue-400 text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 group-hover:border-blue-200">
                                Ver Perfil
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                        <div className="group bg-white dark:bg-card-dark rounded-2xl p-8 shadow-card hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 flex flex-col items-center text-center cursor-pointer">
                            <div className="relative mb-4">
                                <div className="h-24 w-24 rounded-full bg-gray-200 bg-cover bg-center ring-4 ring-gray-50 dark:ring-gray-800 shadow-sm group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYoc5KE9nZSEoN27QMghJjb5HrVQkwJfnzTJfDwuSI8wxgPNh08BZjWls51xIUd5BoB-06UfZ0GsdaXhzYl4uRudO8RcZFpZ9ALLG-VAevDr8oQsQblvyW-HS4yqnL6BNH7K-iQYhhSJ9kLLY3mVY6UxG5T0D0zvJq10gmWZneRODS_Y6Ynj6XmHlDvBBYsvEpRU6Xm739iGq4en-7oKfQOcj6gaQjIjGxbgQvlhkvwNnfu1YBBtnqemzSLGOWuayorpnYWzYO-zhb')" }}></div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Maria Garcia</h3>
                            <p className="text-sm text-secondary font-medium mb-6 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">Avanzado • Fuerza</p>
                            <button className="w-full mt-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary dark:text-blue-400 text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 group-hover:border-blue-200">
                                Ver Perfil
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                        <div className="group bg-white dark:bg-card-dark rounded-2xl p-8 shadow-card hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 flex flex-col items-center text-center cursor-pointer">
                            <div className="relative mb-4">
                                <div className="h-24 w-24 rounded-full bg-gray-200 bg-cover bg-center ring-4 ring-gray-50 dark:ring-gray-800 shadow-sm group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBojqpm02WQY2af6AVEbqvd4zE5-cRtj-22tYQPPXQRfn8O7LD8cUHITAhGP2UyOgGWM_9VjhsDJVKq_VW81NbsJyUyIIrTHC-G_i_82R3PwY9sbWUTT57toSuxItXAWmBot4rc9M46PUKUthwVjsffHOGAsRt7HWSWIrgSvTtAFObi3VzP_eIkK00hlw-z5mjfQR_ziVSnQHNuGmuZd2iHnZyB8Cc9t5sfTk8SnuLvYPfO4cPYheVjibIyH61gdNMhq1xCuVOmdfss')" }}></div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Carlos Lopez</h3>
                            <p className="text-sm text-secondary font-medium mb-6 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">Principiante • Pérdida Peso</p>
                            <button className="w-full mt-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary dark:text-blue-400 text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 group-hover:border-blue-200">
                                Ver Perfil
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                        <div className="group bg-white dark:bg-card-dark rounded-2xl p-8 shadow-card hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 flex flex-col items-center text-center cursor-pointer">
                            <div className="relative mb-4">
                                <div className="h-24 w-24 rounded-full bg-gray-200 bg-cover bg-center ring-4 ring-gray-50 dark:ring-gray-800 shadow-sm group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBIKu7YjBD5Mdlh1JHtR3vlWWOwdTUHCn4QRdrvKVVIWa7K6KB0hP5mt1CMSOogTcjaPed36SE4nM9H1Orru-JZyj3xXyMc6WP-z5errKbA7JISB4Dm8o4OJNOhzvOOunA857pHRVesFg_ZVTy9I54CXQtBGE3bTm3IB3KG6viD0v9EM5j-uxlTItK2FOvtA8D5geEqV7ckStLQtgxLB-WkHFf6uh1ICEkEooP7A-3RKzxLTJf3uiXY_z3_OaZtnrlgGOacJf0ch0Le')" }}></div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Sofia Rodriguez</h3>
                            <p className="text-sm text-secondary font-medium mb-6 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">Intermedio • Rehab</p>
                            <button className="w-full mt-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary dark:text-blue-400 text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 group-hover:border-blue-200">
                                Ver Perfil
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                        <div className="group bg-white dark:bg-card-dark rounded-2xl p-8 shadow-card hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 flex flex-col items-center text-center cursor-pointer">
                            <div className="relative mb-4">
                                <div className="h-24 w-24 rounded-full bg-gray-200 bg-cover bg-center ring-4 ring-gray-50 dark:ring-gray-800 shadow-sm group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-4dfXWgW31t82UvFl--Wsbx9_SOAUpx2Rc_tA40Hr9Q-cXuJpCeP5JXkxeQdQhx8fG8Z7QopfPUuJlfDbJ1BM_UA5n9rRjhK33Pr70Sd1Anp0dDcvNvolrRkOKJsNwaiii-yqK2u5iizgNu3evFTkLktG_R_i-QBizn1yemgsdT3YEaFBSYubc1RlZperguPiLoTRkEI1gNlByk27sJLc1TuhCvDt-Uvor4zX9zYOJd1E_KvddxinPNNcyk92Chg-bsBOCAVI-kOH')" }}></div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Miguel Angel</h3>
                            <p className="text-sm text-secondary font-medium mb-6 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">Avanzado • Powerlifting</p>
                            <button className="w-full mt-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary dark:text-blue-400 text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 group-hover:border-blue-200">
                                Ver Perfil
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
