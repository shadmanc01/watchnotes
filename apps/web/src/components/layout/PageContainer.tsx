import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
};

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main
      style={{
        width: "min(100% - 32px, 1120px)",
        margin: "0 auto",
        padding: "48px 0",
      }}
    >
      {children}
    </main>
  );
}
