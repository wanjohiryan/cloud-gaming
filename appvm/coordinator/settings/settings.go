package settings

type Range struct {
	Min uint16
	Max uint16
}

var (
	AllowedOrigins             []string
	SinglePort                 int
	PortRange                  Range
	IceIpMap                   string
	DisableDefaultInterceptors bool

	VideoCodec string
)

func init() {
	// react port
	AllowedOrigins = []string{"http://localhost:3000"}
	SinglePort = 8443
	DisableDefaultInterceptors = false

	VideoCodec = "vpx"
}
