import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function getCurrentLanguage(): 'ru' | 'en' {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('lifeos-lang');
    if (saved === 'en' || saved === 'ru') return saved;
  }
  return 'ru';
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const isEn = getCurrentLanguage() === 'en';
      const title = isEn ? 'Something went wrong' : 'Что-то пошло не так';
      const desc = isEn
        ? 'An unexpected error occurred in the platform interface.'
        : 'Произошла непредвиденная ошибка в интерфейсе платформы.';
      const reload = isEn ? 'Reload page' : 'Перезагрузить страницу';

      return (
        <div className="error-boundary-container">
          <h2 className="error-boundary-title">{title}</h2>
          <p className="error-boundary-desc">{desc}</p>
          <pre className="error-boundary-details">{this.state.error?.toString()}</pre>
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            {reload}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
