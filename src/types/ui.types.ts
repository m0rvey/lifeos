import type { ModuleKey } from './app.types';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  module?: ModuleKey;
  route: string;
}
