package datasource

type Lap struct {
	LapNumber int    `json:"lap_number"`
	DateStart string `json:"date_start"`
}

type CarData struct {
	Date         string `json:"date"`
	DriverNumber int    `json:"driver_number"`
	Speed        int    `json:"speed"`
	RPM          int    `json:"rpm"`
	NGear        int    `json:"n_gear"`
	Throttle     int    `json:"throttle"`
	Brake        int    `json:"brake"`
	DRS          int    `json:"drs"`
}
