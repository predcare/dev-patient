export enum AppScreen {
  Splash = 'splash',
  Login = 'login',
  Dashboard = 'dashboard',
}

export enum NetworkRoot {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  ERR_NETWORK = 'ERR_NETWORK',
}
export enum ConsultType {
  VIDEO = 'video',
  IN_PERSON = 'in_person',
  CLINIC = 'clinic',
  INSTANT = 'instant',
}

export enum ConsultStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  IN_PROGRESS = 'in_progress',
  RESCHEDULED = 'rescheduled',
  NOT_RESCHEDULED = 'not_rescheduled',
}
