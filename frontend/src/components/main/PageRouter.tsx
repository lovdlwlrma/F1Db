import React from "react";
import { NAVIGATION_ROUTES } from "@/config/routes.config";
import PageTransition from "@/components/common/PageTransition";

interface PageRouterProps {
  activePage: string;
}

const PageRouter: React.FC<PageRouterProps> = ({ activePage }) => {
  const currentRoute = NAVIGATION_ROUTES.find(
    (route) => route.name === activePage
  );

  if (!currentRoute) {
    return (
      <PageTransition pageKey="not-found">
        <div>
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-400">Can't find {activePage} page</p>
        </div>
      </PageTransition>
    );
  }

  const PageComponent = currentRoute.component;

  return (
    <PageTransition pageKey={activePage}>
      <PageComponent />
    </PageTransition>
  );
};

export default PageRouter;