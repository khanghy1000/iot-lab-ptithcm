package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"github.com/labstack/echo/v4"
)

type Stats struct {
	Temperature float64
	Humidity    float64
}

func log(esp8266Url string, db *sql.DB) {
	res, err := http.Get(esp8266Url + "/stats")
	if err != nil {
		fmt.Println("Failed to get data")
		return
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println("Failed to read data")
		return
	}

	fmt.Println(string(body))

	data := Stats{}
	err = json.Unmarshal(body, &data)
	if err != nil {
		fmt.Println("Failed to parse data")
		return
	}

	_, err = db.Exec("INSERT INTO logs (temperature, humidity) VALUES ($1, $2)", data.Temperature, data.Humidity)
	if err != nil {
		fmt.Println("Failed to log data")
	}
}

func main() {
	godotenv.Load()

	var (
		host       = os.Getenv("DB_HOST")
		port, _    = strconv.Atoi(os.Getenv("DB_PORT"))
		user       = os.Getenv("DB_USER")
		password   = os.Getenv("DB_PASSWORD")
		dbname     = os.Getenv("DB_NAME")
		esp8266Url = os.Getenv("ESP8266_URL")
	)

	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		panic(err)
	}

	go func() {
		for {
			log(esp8266Url, db)
			time.Sleep(15 * time.Second)
		}
	}()

	e := echo.New()

	e.Static("/", "public")

	e.Logger.Fatal(e.Start(":8080"))
}
