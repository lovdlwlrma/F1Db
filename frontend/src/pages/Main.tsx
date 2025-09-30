import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarLayout from "@/layouts/SidebarLayout";
import Sidebar from "@/components/Sidebar";
import Overview from "./Overview";
import Telemetry from "./Telemetry";
import Analytics from "./Analytics";

const DashboardPage = () => {
  const [open, setOpen] = useState(true);
  const [activePage, setActivePage] = useState("Overview");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;
    
    if (path === "/") {
      setActivePage("Overview");
      return;
    }

    const pathSegment = path.startsWith("/") ? path.slice(1) : path;
    const pageMap: { [key: string]: string } = {
      'telemetry': 'Telemetry',
      'live-timing': 'Live Timing',
      'analytics': 'Analytics',
      'standings': 'Standings',
      'calendar': 'Calendar',
      'tracks': 'Tracks',
      'drivers': 'Drivers',
      'settings': 'Settings'
    };
    
    const pageName = pageMap[pathSegment] || 'Overview';
    setActivePage(pageName);
  }, [location]);

  const handlePageChange = (page: string) => {
    const pageUrlMap: { [key: string]: string } = {
      'Overview': 'overview',
      'Live Timing': 'live-timing',
      'Telemetry': 'telemetry',
      'Analytics': 'analytics',
      'Standings': 'standings',
      'Calendar': 'calendar',
      'Tracks': 'tracks',
      'Drivers': 'drivers',
      'Settings': 'settings'
    };
    
    const url = pageUrlMap[page] || 'overview';
    
    if (page === 'Overview') {
      navigate('/');
    } else {
      navigate(`/${url}`);
    }
    
    setActivePage(page);
  };
  
  return (
    <div className="h-screen flex flex-col">
      <SidebarLayout 
        open={open} 
        sidebar={
          <Sidebar 
            open={open} 
            onToggle={() => setOpen(!open)}
            activePage={activePage}
            onPageChange={handlePageChange}
          />
        }
      >
        <main className="flex-1 p-4 transition-[padding] duration-700">
          <div key={activePage} className="animate-in slide-in-from-left-4 duration-700">
            {activePage === "Overview" ? (
              <Overview />
            ) : activePage === "Telemetry" ? (
              <Telemetry />
            ) : activePage === "Analytics" ? (
              <Analytics />
            ) : (
              <div>
                <h1 className="text-2xl font-bold mb-4">當前頁面: {activePage}</h1>
                <p>主要內容</p>
                <p className="text-gray-400 mt-2">這是 {activePage} 頁面的內容</p>
              </div>
            )}
          </div>
        </main>
      </SidebarLayout>
    </div>
  );
};

export default DashboardPage;
