/**
 * System Status Module Types
 * Defines types for system health monitoring
 */

export type ModuleStatus = 'connected' | 'not_configured' | 'issue'
export type OverallStatus = 'ready' | 'action_required'

export interface ModuleHealth {
  id: string
  label: string
  status: ModuleStatus
  message: string
}

export interface SystemStatusResponse {
  overall: OverallStatus
  message: string
  modules: ModuleHealth[]
  lastChecked: string
}
