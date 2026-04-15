import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('RouteErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <p className="text-sm font-medium text-foreground">Algo salió mal al cargar esta sección</p>
          {this.state.message && (
            <p className="max-w-md text-xs text-muted-foreground">{this.state.message}</p>
          )}
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-xs text-primary-foreground hover:opacity-90"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
