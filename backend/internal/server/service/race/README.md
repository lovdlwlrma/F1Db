# Race Service

這個服務提供了F1比賽相關的功能，包括查詢下一場比賽和即將到來的比賽。

## 功能

### 1. 獲取下一場比賽
- **端點**: `GET /api/race/next`
- **描述**: 返回下一場即將到來的F1比賽信息
- **響應格式**:
```json
{
  "message": "Next race retrieved successfully",
  "data": {
    "race": {
      "id": 1,
      "year": 2025,
      "grand_prix": "Australian",
      "country": "Melbourne",
      "circuit_name": "Albert Park Circuit",
      "q1_start": "2025-03-14T09:30:00Z",
      "q2_start": "2025-03-14T13:00:00Z",
      "q3_start": "2025-03-15T09:30:00Z",
      "sprint_qualify_start": null,
      "sprint_start": null,
      "qualify_start": "2025-03-15T13:00:00Z",
      "race_start": "2025-03-16T12:00:00Z"
    },
    "is_next_week": true,
    "days_until_race": 5,
    "country_flag": "🇦🇺"
  }
}
```

### 2. 獲取即將到來的比賽列表
- **端點**: `GET /api/race/upcoming`
- **查詢參數**:
  - `limit` (可選): 限制返回的比賽數量，默認為10
- **描述**: 返回即將到來的F1比賽列表
- **響應格式**:
```json
{
  "message": "Upcoming races retrieved successfully",
  "data": [
    {
      "id": 1,
      "year": 2025,
      "grand_prix": "Australian",
      "country": "Melbourne",
      "circuit_name": "Albert Park Circuit",
      "race_start": "2025-03-16T12:00:00Z"
    }
  ],
  "count": 1
}
```

## 數據模型

### Race
- `id`: 比賽ID
- `year`: 年份
- `grand_prix`: 大獎賽名稱
- `country`: 國家/城市
- `circuit_name`: 賽道名稱
- `q1_start`: Q1開始時間
- `q2_start`: Q2開始時間
- `q3_start`: Q3開始時間
- `sprint_qualify_start`: 衝刺排位賽開始時間
- `sprint_start`: 衝刺賽開始時間
- `qualify_start`: 排位賽開始時間
- `race_start`: 正賽開始時間

### NextRaceInfo
- `race`: 比賽信息
- `is_next_week`: 是否為下週的比賽
- `days_until_race`: 距離比賽的天數
- `country_flag`: 國旗emoji

## 支持的國家國旗

服務支持以下國家的國旗emoji：
- 🇦🇺 Australia (Melbourne)
- 🇨🇳 China (Shanghai)
- 🇯🇵 Japan (Suzuka)
- 🇧🇭 Bahrain (Sakhir)
- 🇸🇦 Saudi Arabia (Jeddah)
- 🇦🇿 Azerbaijan (Baku)
- 🇺🇸 USA (Miami, Las Vegas)
- 🇲🇨 Monaco
- 🇨🇦 Canada (Montreal)
- 🇪🇸 Spain (Barcelona)
- 🇦🇹 Austria (Spielberg)
- 🇬🇧 UK (Silverstone)
- 🇭🇺 Hungary (Budapest)
- 🇧🇪 Belgium (Spa)
- 🇳🇱 Netherlands (Zandvoort)
- 🇮🇹 Italy (Monza, Imola)
- 🇸🇬 Singapore
- 🇲🇽 Mexico (Mexico City)
- 🇧🇷 Brazil (São Paulo)
- 🇦🇪 UAE (Abu Dhabi)
- 🇶🇦 Qatar

如果找不到對應的國旗，將返回默認的賽車旗幟 🏁。
