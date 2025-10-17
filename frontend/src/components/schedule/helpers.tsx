import { Race } from "@/types/schedule";

export const isPastRace = (race: Race): boolean => {
	return new Date(race.end_date) < new Date();
};

export const isUpcomingRace = (race: Race): boolean => {
	const now = new Date();
	const start = new Date(race.start_date);
	const end = new Date(race.end_date);
	return start <= now && now <= end;
};

export const groupRacesByMonth = (races: Race[]): { [key: string]: Race[] } => {
	const grouped: { [key: string]: Race[] } = {};
	races.forEach((race) => {
		const month = new Date(race.start_date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
		});
		if (!grouped[month]) {
			grouped[month] = [];
		}
		grouped[month].push(race);
	});
	return grouped;
};
