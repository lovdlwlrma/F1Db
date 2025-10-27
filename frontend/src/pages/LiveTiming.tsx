import React, { useState, useEffect } from "react";
import {
  WifiOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { useLiveTiming } from "@/hooks/useLiveTiming";

// ==================== JSON 查看器元件 ====================

const LiveTimingPage: React.FC = () => {
  const { data, connectionStatus, isInitialized, isConnected } =
    useLiveTiming();
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  // 監聽資料更新
  useEffect(() => {
    if (data) {
      setUpdateCount((prev) => prev + 1);
    }
  }, [data]);

  // 取得狀態圖示
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "CONNECTED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "CONNECTING":
      case "RECONNECTING":
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      case "FAILED":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <WifiOff className="w-5 h-5 text-gray-500" />;
    }
  };

  // 取得狀態顏色
  const getStatusColor = () => {
    switch (connectionStatus) {
      case "CONNECTED":
        return "text-green-400";
      case "CONNECTING":
        return "text-yellow-400";
      case "RECONNECTING":
        return "text-orange-400";
      case "FAILED":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  // 複製 JSON
  const copyToClipboard = () => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 取得要顯示的資料
  const getDisplayData = () => {
    if (!data) return null;

    if (selectedTab === "all") {
      return data;
    }

    return (data as any)[selectedTab] || null;
  };

  // 可用的 Tab
  const tabs = data ? ["all", ...Object.keys(data)] : ["all"];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* 標題列 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              F1 Live Timing - JSON 資料查看器
            </h1>
            <p className="text-gray-400">即時顯示 SSE 串流資料</p>
          </div>

          {/* 連線狀態 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <div>
                <div className="text-xs text-gray-400">連線狀態</div>
                <div className={`font-bold ${getStatusColor()}`}>
                  {connectionStatus}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-400">更新次數</div>
              <div className="text-2xl font-bold text-blue-400">
                {updateCount}
              </div>
            </div>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            {/* Tab 切換 */}
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    selectedTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {tab === "all" ? "完整資料" : tab}
                </button>
              ))}
            </div>

            {/* 搜尋 & 複製 */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="搜尋..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={copyToClipboard}
                disabled={!data}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    複製 JSON
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 狀態提示 */}
        {!isConnected && (
          <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-200">
                {connectionStatus === "CONNECTING"
                  ? "正在連線到 F1 即時資料串流..."
                  : "未連線"}
              </span>
            </div>
          </div>
        )}

        {isConnected && !isInitialized && (
          <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-blue-200">
                等待初始資料 (initial event)...
              </span>
            </div>
          </div>
        )}

        {/* JSON 資料顯示區 */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
            <span className="font-mono text-sm text-gray-300">
              {selectedTab === "all"
                ? "F1State (完整資料)"
                : `F1State.${selectedTab}`}
            </span>
            {data && (
              <span className="text-xs text-gray-400">
                大小:{" "}
                {(JSON.stringify(getDisplayData()).length / 1024).toFixed(2)} KB
              </span>
            )}
          </div>

          <div className="p-6">
            {data ? (
              <pre className="bg-black rounded-lg p-4 overflow-auto max-h-[70vh] text-sm font-mono">
                {JSON.stringify(getDisplayData(), null, 2)}
              </pre>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <WifiOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>尚無資料</p>
              </div>
            )}
          </div>
        </div>

        {/* 資料統計 */}
        {data && (
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">資料欄位數</div>
              <div className="text-2xl font-bold">
                {Object.keys(data).length}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">已初始化</div>
              <div className="text-2xl font-bold">
                {isInitialized ? "✓" : "✗"}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">更新次數</div>
              <div className="text-2xl font-bold text-blue-400">
                {updateCount}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">當前 Tab</div>
              <div className="text-2xl font-bold text-green-400">
                {selectedTab}
              </div>
            </div>
          </div>
        )}

        {/* 除錯資訊 */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3">除錯資訊</h3>
          <div className="grid grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <span className="text-gray-400">連線狀態:</span>{" "}
              <span className={getStatusColor()}>{connectionStatus}</span>
            </div>
            <div>
              <span className="text-gray-400">已初始化:</span>{" "}
              <span
                className={isInitialized ? "text-green-400" : "text-red-400"}
              >
                {isInitialized ? "true" : "false"}
              </span>
            </div>
            <div>
              <span className="text-gray-400">資料存在:</span>{" "}
              <span className={data ? "text-green-400" : "text-red-400"}>
                {data ? "true" : "false"}
              </span>
            </div>
            <div>
              <span className="text-gray-400">更新計數:</span>{" "}
              <span className="text-blue-400">{updateCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTimingPage;
