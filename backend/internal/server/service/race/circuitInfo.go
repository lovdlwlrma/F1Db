package race

import (
	"fmt"
	"net/http"

	"github.com/PuerkitoBio/goquery"
)

func (s *Service) GetCircuitInfo(year int, race string) (map[string]string, error) {
	url := fmt.Sprintf("https://www.formula1.com/en/racing/%d/%s", year, race)
	res, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("http get error: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return nil, fmt.Errorf("status code error: %d %s", res.StatusCode, res.Status)
	}

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return nil, fmt.Errorf("goquery parse error: %w", err)
	}

	data := make(map[string]string)

	doc.Find("div.pt-px-16.pb-px-16, div.pt-px-16.pb-px-32").Each(func(i int, s *goquery.Selection) {
		label := s.Find("dt").Text()
		value := s.Find("dd").Text()
		extra := s.Find("span").Text()
		if label != "" {
			data[label] = value + " " + extra
		}
	})

	return data, nil
}
