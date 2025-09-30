package datasync

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"strings"

	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

func RunImport(db *sql.DB, logger *zap.Logger) {
	files, err := filepath.Glob("static/init/*.json")
	if err != nil {
		logger.Error("Failed to scan init json files", zap.Error(err))
		return
	}

	for _, file := range files {
		data, err := os.ReadFile(file)
		if err != nil {
			logger.Error("Failed to load json file", zap.String("file", file), zap.Error(err))
			continue
		}

		inserted, err := InsertJSON(db, "f1_schedule", data, reflect.TypeOf(F1Schedule{}), []string{"year", "grand_prix", "circuit_name"})
		if err != nil {
			logger.Error("Failed to insert json file", zap.String("file", file), zap.Error(err))
		} else {
			logger.Info("Insert Success", zap.String("file", file), zap.Int("rows", inserted))
		}
	}
}

func InsertJSON(db *sql.DB, table string, data []byte, modelType reflect.Type, conflictCols []string) (int, error) {
	slice := reflect.New(reflect.SliceOf(modelType)).Interface()
	if err := json.Unmarshal(data, slice); err != nil {
		return 0, fmt.Errorf("JSON Marshall Failed: %w", err)
	}

	records := reflect.ValueOf(slice).Elem()
	if records.Len() == 0 {
		return 0, nil
	}

	t := modelType
	cols := []string{}
	placeholders := []string{}
	for i := 0; i < t.NumField(); i++ {
		dbTag := t.Field(i).Tag.Get("db")
		if dbTag == "" {
			continue
		}
		cols = append(cols, dbTag)
		placeholders = append(placeholders, fmt.Sprintf("$%d", len(cols)))
	}

	sqlStr := fmt.Sprintf(
		"INSERT INTO %s (%s) VALUES (%s)",
		table,
		strings.Join(cols, ", "),
		strings.Join(placeholders, ", "),
	)
	if len(conflictCols) > 0 {
		sqlStr += fmt.Sprintf(" ON CONFLICT (%s) DO NOTHING", strings.Join(conflictCols, ", "))
	}

	insertedCount := 0
	for i := 0; i < records.Len(); i++ {
		rec := records.Index(i)
		vals := []interface{}{}
		for j := 0; j < t.NumField(); j++ {
			dbTag := t.Field(j).Tag.Get("db")
			if dbTag == "" {
				continue
			}

			v := rec.Field(j).Interface()
			if str, ok := v.(string); ok && str == "" {
				vals = append(vals, nil)
			} else {
				vals = append(vals, v)
			}
		}

		result, err := db.Exec(sqlStr, vals...)
		if err != nil {
			return insertedCount, fmt.Errorf("插入第 %d 筆錯誤: %w", i+1, err)
		}

		rowsAffected, _ := result.RowsAffected()
		insertedCount += int(rowsAffected)
	}

	return insertedCount, nil
}
