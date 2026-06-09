export const dictionnaire: Record<string, Record<string, string>> = {
    en: {
        app_subtitle: "Focus & Productivity",
        input_placeholder: "What's next ?",
        btn_add: "Add",
        btn_logout: "Logout",
        menu_rename: "Rename",
        menu_delete: "Delete",
        settings_title: "Settings",
        settings_account: "Account",
        settings_logged_as: "Logged in as ",
        settings_display: "Display",

        settings_language: "Language",
        settings_theme: "Theme",
        settings_dark: "Dark",
        settings_light: "Light",
    },
    fr: {
        app_subtitle: "Focus & Productivité",
        input_placeholder: "Quelle est la suite ?",
        btn_add: "Ajouter",
        btn_logout: "Déconnexion",
        menu_rename: "Renommer",
        menu_delete: "Supprimer",
        settings_title: "Paramètres",
        settings_account: "Compte",
        settings_language: "Langue",
        settings_theme: "Thème",
        settings_dark: "Sombre",
        settings_light: "Clair",
        settings_logged_as: "Connecté en tant que "
    }
};

// Global variable to store the active language, initialized from localStorage or defaulting to 'en'
export let langueActive: string = localStorage.getItem('langue') || 'en';