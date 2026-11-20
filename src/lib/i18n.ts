import type { Lang } from "@/lib/types";

export const copy = {
  en: {
    home: "Home",
    teams: "Teams",
    events: "Events",
    learn: "Learn",
    chat: "Chat",
    search: "Search",
    notifications: "Notifications",
    profile: "Profile",
    account: "Account",
    applications: "Applications",
    saved: "Saved teams",
    signIn: "Sign in",
    createAccount: "Create account",
    continue: "Continue",
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    skip: "Skip",
    next: "Next",
    getStarted: "Get started",
    logout: "Log out",
    sampleNote: "Sample data stays on this device until a live service is connected.",
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    findTeams: "Find teams",
    myApplications: "My applications",
    upcomingTryouts: "Upcoming tryouts",
    languageTitle: "Language",
    appearance: "Appearance",
    dark: "Dark",
    light: "Light",
    help: "Help and support",
    about: "About",
    offline: "You appear to be offline. Lists will show an error until the connection returns.",
    spanishContent: "",
  },
  es: {
    home: "Inicio",
    teams: "Equipos",
    events: "Eventos",
    learn: "Aprender",
    chat: "Chat",
    search: "Buscar",
    notifications: "Avisos",
    profile: "Perfil",
    account: "Cuenta",
    applications: "Solicitudes",
    saved: "Equipos guardados",
    signIn: "Entrar",
    createAccount: "Crear cuenta",
    continue: "Continuar",
    back: "Atrás",
    save: "Guardar",
    cancel: "Cancelar",
    skip: "Omitir",
    next: "Siguiente",
    getStarted: "Empezar",
    logout: "Cerrar sesión",
    sampleNote: "Los datos de muestra permanecen en este dispositivo.",
    goodMorning: "Buenos días",
    goodAfternoon: "Buenas tardes",
    goodEvening: "Buenas noches",
    findTeams: "Buscar equipos",
    myApplications: "Mis solicitudes",
    upcomingTryouts: "Pruebas próximas",
    languageTitle: "Idioma",
    appearance: "Apariencia",
    dark: "Oscuro",
    light: "Claro",
    help: "Ayuda y soporte",
    about: "Acerca de",
    offline: "Parece que no hay conexión. Las listas mostrarán un error hasta que vuelva.",
    spanishContent: "La navegación sigue este idioma. El contenido de muestra de equipos sigue en inglés.",
  },
} as const;

export type Copy = { [K in keyof (typeof copy)["en"]]: string };

export function dictionary(lang: Lang): Copy {
  return copy[lang];
}

export function issueText(code: string, lang: Lang) {
  const es = lang === "es";
  switch (code) {
    case "required":
      return es ? "Este campo es obligatorio." : "This field is required.";
    case "email":
      return es ? "Introduce un correo válido." : "Enter a valid email address.";
    case "password":
      return es
        ? "Usa al menos 8 caracteres, con una letra y un número."
        : "Use at least 8 characters, with a letter and a number.";
    case "match":
      return es ? "Las contraseñas no coinciden." : "Passwords do not match.";
    case "phone":
      return es ? "Introduce un teléfono de EE. UU. de 10 dígitos." : "Enter a 10-digit US phone number.";
    case "otp":
      return es ? "Ese código no coincide con el código de muestra." : "That code does not match the sample code.";
    case "short":
      return es ? "Escribe al menos 10 caracteres." : "Write at least 10 characters.";
    default:
      return es ? "Revisa este campo." : "Check this field.";
  }
}
