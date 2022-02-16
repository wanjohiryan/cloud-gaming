package utils

import (
	"encoding/base64"
	"encoding/json"
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

func MustStrToInt(val string) int {
	iVal, err := strconv.ParseInt(val, 10, 32)
	if err != nil {
		panic(fmt.Sprintf("Couldn't convert str to int: %s", err))
	}

	return int(iVal)
}

func EncodeBase64(obj interface{}) (string, error) {
	b, err := json.Marshal(obj)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(b), nil
}

func DecodeBase64(in string, obj interface{}) error {
	b, err := base64.StdEncoding.DecodeString(in)
	if err != nil {
		return err
	}

	err = json.Unmarshal(b, obj)
	if err != nil {
		return err
	}

	return nil
}
