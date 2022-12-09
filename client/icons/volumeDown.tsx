import * as React from "react"
import { SVGProps } from "react"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>{"Volume Down"}</title>
        <g
            stroke="#FFF"
            strokeWidth={1.5}
            fill="none"
            fillRule="evenodd"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18.656 8.635a7.568 7.568 0 0 1 0 7.305M4.667 12.287c-.003 1.219 0 2.648 1.006 3.503 1.007.855 1.806.502 3.108.93 1.303.43 3.128 3.077 5.144 1.881 1.09-.774 1.604-2.235 1.604-6.314 0-4.078-.491-5.523-1.604-6.313-2.016-1.195-3.84 1.452-5.144 1.88-1.302.43-2.101.077-3.108.931-1.006.854-1.01 2.284-1.006 3.502Z" />
        </g>
    </svg>
)

export default SvgComponent
