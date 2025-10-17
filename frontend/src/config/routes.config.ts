// config/navigation.config.ts
import Overview from "@/pages/Overview";
import Telemetry from "@/pages/Telemetry";
import Analytics from "@/pages/Analytics";
import Standings from "@/pages/Standings";
import Schedule from "@/pages/Schedule";

export interface NavigationRoute {
  name: string;
  path: string;
  urlSegment: string;
  component: React.ComponentType;
}

export const NAVIGATION_ROUTES: NavigationRoute[] = [
  {
    name: "Overview",
    path: "/",
    urlSegment: "",
    component: Overview,
  },
  {
    name: "Telemetry",
    path: "/telemetry",
    urlSegment: "telemetry",
    component: Telemetry,
  },
  {
    name: "Live Timing",
    path: "/live-timing",
    urlSegment: "live-timing",
    component: Telemetry, // Temporary use Telemetry component
  },
  {
    name: "Analytics",
    path: "/analytics",
    urlSegment: "analytics",
    component: Analytics,
  },
  {
    name: "Standings",
    path: "/standings",
    urlSegment: "standings",
    component: Standings,
  },
  {
    name: "Schedule",
    path: "/schedule",
    urlSegment: "schedule",
    component: Schedule,
  },
];

// 根據路徑獲取路由配置
export const getRouteByPath = (path: string): NavigationRoute | undefined => {
  // 處理根路徑
  if (path === "/") {
    return NAVIGATION_ROUTES.find((route) => route.name === "Overview");
  }

  // 移除開頭的斜線
  const pathSegment = path.startsWith("/") ? path.slice(1) : path;

  // 查找匹配的路由
  return NAVIGATION_ROUTES.find(
    (route) => route.urlSegment === pathSegment
  );
};

// 根據頁面名稱獲取路由配置
export const getRouteByName = (
  name: string
): NavigationRoute | undefined => {
  return NAVIGATION_ROUTES.find((route) => route.name === name);
};

// 根據頁面名稱獲取路徑
export const getPathByName = (name: string): string => {
  const route = getRouteByName(name);
  return route?.path || "/";
};

// 根據路徑獲取頁面名稱
export const getNameByPath = (path: string): string => {
  const route = getRouteByPath(path);
  return route?.name || "Overview";
};

// 獲取所有頁面名稱（用於 Sidebar）
export const getAllPageNames = (): string[] => {
  return NAVIGATION_ROUTES.map((route) => route.name);
};