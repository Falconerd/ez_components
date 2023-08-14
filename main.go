package main

import (
	"fmt"
	"time"
)

func main() {
	// Example usage
	startTime := time.Now()

	html := compileHtmlFromFile("./test.html")
	duration := time.Since(startTime)

	fmt.Println(html)
	fmt.Printf("Time taken to compile: %v\n", duration)

}
