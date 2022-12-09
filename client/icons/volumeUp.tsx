import * as React from "react"
import { SVGProps } from "react"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>{"Volume Up"}</title>
    <g
      stroke="#FFF"
      strokeWidth={1.5}
      fill="none"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.436 5.774c2.493 3.72 2.5 8.63 0 12.358M16.989 8.217a7.74 7.74 0 0 1 0 7.472M2.682 11.953c-.002 1.246 0 2.708 1.03 3.582 1.03.874 1.846.513 3.178.952 1.332.439 3.199 3.146 5.26 1.923 1.115-.792 1.64-2.286 1.64-6.457 0-4.171-.501-5.65-1.64-6.457C10.09 4.274 8.222 6.98 6.89 7.419c-1.332.44-2.149.078-3.179.952-1.029.874-1.031 2.336-1.029 3.582Z" />
    </g>
  </svg>
)

export default SvgComponent
