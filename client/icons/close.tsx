import * as React from "react"
import { SVGProps } from "react"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" {...props}>
    <path d="M4 16V4H2v12h2zm9-1-1.5-1.5L14 11H6V9h8l-2.5-2.5L13 5l5 5-5 5z" />
  </svg>
)

export default SvgComponent
