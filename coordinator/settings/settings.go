package settings

import "coordinator/utils"

var (
	ScreenWidth    float32
	ScreenHeight   float32
	AllowedOrigins []string
)

func init() {
	ScreenWidth = utils.MustStrToFloat32(utils.MustEnv("SCREEN_WIDTH"))
	ScreenHeight = utils.MustStrToFloat32(utils.MustEnv("SCREEN_HEIGHT"))

	AllowedOrigins = []string{"*"}
}
