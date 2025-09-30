package cassandra

import (
	"fmt"
	"time"

	"github.com/gocql/gocql"
)

type Log struct {
	ID        string    `json:"id"`
	Message   string    `json:"message"`
	Level     string    `json:"level"`
	Timestamp time.Time `json:"timestamp"`
}

type CassandraDB struct {
	session *gocql.Session
}

func NewCassandraDB(hosts []string, keyspace string) (*CassandraDB, error) {
	var initSession *gocql.Session
	var err error

	// 重試邏輯：嘗試建立初始連接
	for retries := 0; retries < 5; retries++ {
		// 首先建立一個不指定 keyspace 的連接
		initCluster := gocql.NewCluster(hosts...)
		initCluster.Consistency = gocql.Quorum
		initCluster.ConnectTimeout = time.Second * 10
		initCluster.Timeout = time.Second * 10
		initCluster.RetryPolicy = &gocql.SimpleRetryPolicy{NumRetries: 3}

		initSession, err = initCluster.CreateSession()
		if err == nil {
			break
		}

		if retries < 4 {
			time.Sleep(time.Second * 5)
		}
	}

	if err != nil {
		return nil, fmt.Errorf("failed to connect to cassandra after retries: %w", err)
	}
	defer initSession.Close()

	// 建立 keyspace
	if err := createKeyspace(initSession, keyspace); err != nil {
		return nil, fmt.Errorf("failed to create keyspace: %w", err)
	}

	// 建立新的連接，這次指定 keyspace
	cluster := gocql.NewCluster(hosts...)
	cluster.Keyspace = keyspace
	cluster.Consistency = gocql.Quorum
	cluster.ConnectTimeout = time.Second * 10
	cluster.Timeout = time.Second * 10
	cluster.RetryPolicy = &gocql.SimpleRetryPolicy{NumRetries: 3}

	var session *gocql.Session
	// 重試邏輯：嘗試建立帶 keyspace 的連接
	for retries := 0; retries < 5; retries++ {
		session, err = cluster.CreateSession()
		if err == nil {
			break
		}

		if retries < 4 {
			time.Sleep(time.Second * 5)
		}
	}

	if err != nil {
		return nil, fmt.Errorf("failed to connect to cassandra with keyspace after retries: %w", err)
	}

	// 建立資料表
	if err := createTable(session); err != nil {
		session.Close()
		return nil, fmt.Errorf("failed to create table: %w", err)
	}

	return &CassandraDB{session: session}, nil
}

func createKeyspace(session *gocql.Session, keyspace string) error {
	query := fmt.Sprintf(`CREATE KEYSPACE IF NOT EXISTS %s 
		WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}`, keyspace)
	return session.Query(query).Exec()
}

func createTable(session *gocql.Session) error {
	query := `CREATE TABLE IF NOT EXISTS logs (
		id uuid,
		message text,
		level text,
		timestamp timestamp,
		PRIMARY KEY (id)
	)`
	return session.Query(query).Exec()
}

func (c *CassandraDB) InsertLog(log *Log) error {
	query := `INSERT INTO logs (id, message, level, timestamp) VALUES (?, ?, ?, ?)`
	return c.session.Query(query, gocql.TimeUUID(), log.Message, log.Level, log.Timestamp).Exec()
}

func (c *CassandraDB) GetRecentLogs(limit int) ([]Log, error) {
	var logs []Log
	query := `SELECT id, message, level, timestamp FROM logs LIMIT ?`
	scanner := c.session.Query(query, limit).Iter().Scanner()

	for scanner.Next() {
		var log Log
		err := scanner.Scan(&log.ID, &log.Message, &log.Level, &log.Timestamp)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	return logs, nil
}

func (c *CassandraDB) Close() {
	if c.session != nil {
		c.session.Close()
	}
}

func (c *CassandraDB) Ping() error {
	return c.session.Query("SELECT now() FROM system.local").Exec()
}
