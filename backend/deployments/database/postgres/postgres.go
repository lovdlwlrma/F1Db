package postgres

import (
	"database/sql"
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type PostgresDB struct {
	db *gorm.DB
}

func NewPostgresDB(host, user, password, dbname string, port int) (*PostgresDB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable",
		host, user, password, dbname, port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to postgres: %w", err)
	}

	// Auto migrate the schema
	// if err := db.AutoMigrate(&User{}); err != nil {
	// 	return nil, fmt.Errorf("failed to migrate schema: %w", err)
	// }

	return &PostgresDB{db: db}, nil
}

func (p *PostgresDB) CreateUser(user *User) error {
	return p.db.Create(user).Error
}

func (p *PostgresDB) GetUser(id uint) (*User, error) {
	var user User
	if err := p.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (p *PostgresDB) ListUsers() ([]User, error) {
	var users []User
	if err := p.db.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (p *PostgresDB) UpdateUser(user *User) error {
	return p.db.Save(user).Error
}

func (p *PostgresDB) DeleteUser(id uint) error {
	return p.db.Delete(&User{}, id).Error
}

func (p *PostgresDB) GetDB() (*sql.DB, error) {
	return p.db.DB()
}

func (p *PostgresDB) Ping() error {
	sqlDB, err := p.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}
