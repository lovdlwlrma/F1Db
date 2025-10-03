package datasync

type F1Schedule struct {
	Year               int    `json:"year" db:"year"`
	GrandPrix          string `json:"grand_prix" db:"grand_prix"`
	Country            string `json:"country" db:"country"`
	CircuitName        string `json:"circuit_name" db:"circuit_name"`
	Q1Start            string `json:"q1_start" db:"q1_start"`
	Q2Start            string `json:"q2_start" db:"q2_start"`
	Q3Start            string `json:"q3_start" db:"q3_start"`
	SprintQualifyStart string `json:"sprint_qualify_start" db:"sprint_qualify_start"`
	SprintStart        string `json:"sprint_start" db:"sprint_start"`
	QualifyStart       string `json:"qualify_start" db:"qualify_start"`
	RaceStart          string `json:"race_start" db:"race_start"`
}
