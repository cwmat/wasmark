import { MainLayout } from "@/components/layout/MainLayout";
import { Workspace } from "@/components/workspace/Workspace";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export default function App() {
  return (
    <MainLayout>
      <ErrorBoundary fallbackLabel="Application error">
        <Workspace />
      </ErrorBoundary>
    </MainLayout>
  );
}
