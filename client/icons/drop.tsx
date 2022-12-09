import * as React from "react"
import { SVGProps } from "react"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="m4.026 3.975 12 .052.008-2-12-.052zm.96 9.004 1.507-1.493 2.49 2.51.034-8 2 .01-.035 8 2.51-2.49 1.494 1.507L9.965 18z" />
    </svg>
)

export default SvgComponent
