import { Race } from "@/types/race";
import {
  MapPin,
  Calendar,
  Map,
  Flag,
  Gauge,
  Timer,
  Wrench,
  Pin,
} from "lucide-react";

interface RaceDetailModalProps {
  race: Race;
  onClose: () => void;
}

export default function RaceDetailModal({
  race,
  onClose,
}: RaceDetailModalProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-red-500/40 shadow-2xl shadow-red-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with background image */}
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          {race.circuit.track_url ? (
            <div className="absolute inset-0">
              <img
                src={race.circuit.track_url}
                alt={race.circuit.name}
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-900" />
          )}

          <div className="relative h-full p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {race.country_flag_image_url && (
                  <img
                    src={race.country_flag_image_url}
                    alt={race.country}
                    className="w-12 h-8 object-cover rounded shadow-lg border border-white/20"
                  />
                )}
                <div className="bg-red-600/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-red-400/30">
                  <span className="text-white font-bold text-sm">
                    {race.round === 0
                      ? "PRE-SEASON TEST"
                      : `ROUND ${race.round}`}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition backdrop-blur-sm bg-black/30"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            <div>
              <h2 className="text-4xl font-black text-white mb-3 mt-3 tracking-tight drop-shadow-lg">
                {race.name}
              </h2>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold">{race.circuit.name}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 mt-1">
                <Calendar className="w-5 h-4" />
                <span className="text-sm">
                  {formatDateRange(race.start_date, race.end_date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 pd-6 px-6 pb-6 space-y-5">
          {/* Circuit Track Image */}
          {race.circuit.map_url && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-3">
                <Map className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold text-white">Circuit Layout</h3>
              </div>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src={race.circuit.map_url}
                  alt={`${race.circuit.name} layout`}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Schedule */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-red-400" />
              Event Schedule
            </h3>
            <div className="space-y-3">
              {race.sessions.map((session) => (
                <div
                  key={session.session_key}
                  className={`relative overflow-hidden rounded-lg transition-all hover:scale-[1.02] ${
                    session.type === "Race" || session.name === "Sprint"
                      ? "bg-gray-900/80 border border-red-500/60 shadow-[0_0_10px_rgba(255,80,80,0.3)] hover:shadow-[0_0_15px_rgba(255,100,100,0.4)]"
                      : "bg-gray-700/40 border border-gray-600/50 hover:border-gray-500/70 hover:shadow-[0_0_6px_rgba(0,0,0,0.2)]"
                  }`}
                >
                  <div className="p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`${
                            session.name === "Race"
                              ? "text-red-400"
                              : session.name === "Qualifying" ||
                                  session.name === "Sprint Qualifying"
                                ? "text-yellow-400"
                                : session.name === "Sprint"
                                  ? "text-orange-400"
                                  : "text-gray-400"
                          }`}
                        >
                          {session.name === "Race" ? (
                            <Flag className="w-6 h-6" />
                          ) : session.name === "Sprint" ? (
                            <Gauge className="w-6 h-6" />
                          ) : session.name === "Qualifying" ||
                            session.name === "Sprint Qualifying" ? (
                            <Timer className="w-6 h-6" />
                          ) : (
                            <Wrench className="w-6 h-6" />
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="grid grid-cols-[80px_240px_1fr] items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded text-center ${
                              session.type === "Race" ||
                              session.name === "Sprint"
                                ? "bg-red-500 text-white"
                                : "bg-gray-600 text-gray-200"
                            }`}
                          >
                            {session.type.split(" ")[0]}
                          </span>
                          <span className="font-bold text-lg pl-8 text-white text-left">
                            {session.name}
                          </span>

                          <div className="flex items-center pl-8 gap-1 text-sm text-gray-300">
                            <span
                              className={
                                session.name === "Race" ||
                                session.name === "Sprint"
                                  ? "text-white"
                                  : "text-gray-400"
                              }
                            >
                              {formatDateTime(session.start_date)}
                            </span>
                            <span
                              className={
                                session.type === "Race" ||
                                session.name === "Sprint"
                                  ? "text-white"
                                  : "text-gray-400"
                              }
                            >
                              → {formatDateTime(session.end_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {(session.type === "Race" || session.name === "Sprint") && (
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-5 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Pin className="w-6 h-6 text-red-400" />
              Circuit & Location Information
            </h3>

            {/* Location Details */}
            <div className="mb-5 pb-5 border-b border-gray-700/50">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <p className="text-gray-400 text-sm mb-1 text-center">
                    Country
                  </p>
                  <div className="flex items-center gap-2 justify-center">
                    {race.country_flag_image_url && (
                      <img
                        src={race.country_flag_image_url}
                        alt={race.country}
                        className="w-6 h-4 object-cover rounded"
                      />
                    )}
                    <p className="text-white font-semibold">{race.country}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">City</p>
                  <p className="text-white font-semibold">{race.city}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Coordinates</p>
                  <p className="text-white font-mono text-sm">
                    {race.circuit.latitude.toFixed(3)}°,{" "}
                    {race.circuit.longitude.toFixed(3)}°
                  </p>
                </div>
              </div>
            </div>

            {/* Circuit Statistics */}
            {race.circuit.info && race.circuit.info.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {race.circuit.info.map(
                  (info, index) =>
                    info.value && (
                      <div
                        key={index}
                        className="bg-gray-700/40 rounded-lg p-4 border border-gray-600/30 hover:border-red-500/40 transition-colors"
                      >
                        <p className="text-gray-400 text-sm mb-1">{info.key}</p>
                        <p className="text-white font-bold text-lg">
                          {info.key === "Lap Record" ? (
                            <>
                              <div>
                                <span className="text-right">
                                  {info.value.split(" ")[0]}
                                </span>
                                <br />
                                <span className="text-sm text-left">
                                  {info.value.split(" ").slice(1).join(" ")}
                                </span>
                              </div>
                            </>
                          ) : (
                            info.value
                          )}
                          {info.annotation && (
                            <span className="text-red-400 text-base">
                              {info.annotation}
                            </span>
                          )}
                        </p>
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
