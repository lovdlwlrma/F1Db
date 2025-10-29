import React, { useState, useEffect } from "react";
import LiveTimingLayout from "@/layouts/LiveTimingLayout";
import { useLiveTiming } from "@/hooks/useLiveTiming";

const LiveTimingPage: React.FC = () => {
  const {
    rawData: _rawData,
    data,
    connectionStatus,
    isInitialized,
    isConnected,
  } = useLiveTiming();
  // const [selectedTab, setSelectedTab] = useState("all");
  // const [searchQuery, setSearchQuery] = useState("");
  // const [copied, setCopied] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  // 監聽資料更新
  useEffect(() => {
    if (data) {
      setUpdateCount((prev) => prev + 1);
    }
  }, [data]);

  const loading = !isInitialized || !isConnected;

  return (
    <LiveTimingLayout
      session={data?.session}
      weather={data?.weather}
      drivers={data?.drivers}
      raceControl={data?.raceControl}
      connectionStatus={connectionStatus}
      updateCount={updateCount}
      loading={loading}
      error={null}
      onRetry={() => window.location.reload()}
    />
  );
};

export default LiveTimingPage;
