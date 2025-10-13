// components/calendar/RaceDetailModal.tsx

import React from "react";
import { MapPin } from "lucide-react";
import { Race } from "@/types/calendar";

interface RaceDetailModalProps {
  race: Race;
  onClose: () => void;
}

export const RaceDetailModal: React.FC<RaceDetailModalProps> = ({
  race,
  onClose,
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-red-500/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-red-200 text-sm mb-2">
                {race.round === 0 ? "Season Test" : `Round ${race.round}`}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {race.title}
              </h2>
              <div className="flex items-center gap-3 text-white/90">
                <MapPin className="w-5 h-5" />
                <span>{race.circuit.name}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">Schedule</h3>
            <div className="space-y-3">
              {race.sessions.map((session) => (
                <div
                  key={session.session_key}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    session.type === "Race"
                      ? "bg-gradient-to-r from-red-600/30 to-red-500/20 border border-red-500/40"
                      : "bg-gray-700/40 border border-gray-600/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        session.type === "Race"
                          ? "bg-red-500 animate-pulse"
                          : "bg-gray-500"
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        session.type === "Race"
                          ? "text-red-300"
                          : "text-gray-200"
                      }`}
                    >
                      {session.name}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-mono ${
                      session.type === "Race" ? "text-red-200" : "text-gray-400"
                    }`}
                  >
                    {formatDateTime(session.start_date)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">Circuit Info</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Country</span>
                <span className="font-semibold">{race.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">City</span>
                <span className="font-semibold">{race.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Circuit</span>
                <span className="font-semibold">{race.circuit.name}</span>
              </div>
            </div>
          </div>

          {race.circuit.info && race.circuit.info.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-3">
                Circuit Data
              </h3>
              <div className="space-y-2 text-gray-300">
                {race.circuit.info.map(
                  (info, index) =>
                    info.value && (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-400">{info.key}</span>
                        <span className="font-semibold">
                          {info.value} {info.annotation || ""}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
