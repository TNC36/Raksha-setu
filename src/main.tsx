import React from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import "./index.css";
import "./i18n";

const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string
);

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[Raksha Setu] Runtime error:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white text-neutral-900 p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Something went wrong</p>
            <p className="mt-2 text-xs text-neutral-500 break-words">
              {this.state.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-xs bg-neutral-900 text-white rounded-lg"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </ConvexProvider>
  </React.StrictMode>
);
