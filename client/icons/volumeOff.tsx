import * as React from "react"
import { SVGProps } from "react"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>{"Volume Off"}</title>
    <g
      stroke="#FFF"
      strokeWidth={2}
      fill="none"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.404 16.553c-1.083-.25-1.817-.053-2.72-.814-1.012-.859-1.02-2.3-1.012-3.525-.008-1.226 0-2.666 1.012-3.525 1.01-.86 1.816-.51 3.131-.94 1.306-.43 3.14-3.096 5.172-1.897.823.582 1.306 1.53 1.503 3.615M15.58 13.672c-.117 3.006-.636 4.214-1.593 4.894-1.038.618-2.031.215-2.917-.384M20.285 4.671 4.941 20.016" />
    </g>
  </svg>
)

export default SvgComponent
