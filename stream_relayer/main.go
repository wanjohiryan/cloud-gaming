package main

import (
	"fmt"
	"os"
	"strconv"
)

func MustEnv(name string) string {
	env := os.Getenv(name)
	if env == "" {
		panic(fmt.Sprintf("Missing env %s", name))
	}

	return env
}

func MustStrToFloat32(val string) float32 {
	fVal, err := strconv.ParseFloat(val, 32)
	if err != nil {
		panic(fmt.Sprintf("Couldn't convert str to float32: %s", err))
	}

	return float32(fVal)
}

func main() {
	ID := MustEnv("id")
	screenWidth := MustStrToFloat32(MustEnv("screenwidth"))
	screenHeight := MustStrToFloat32(MustEnv("screenheight"))

}
