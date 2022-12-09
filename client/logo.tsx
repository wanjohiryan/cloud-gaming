import * as React from "react"
import { SVGProps } from "react";

const start ="#00e1fd";
const end ="#fc007a"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={30}
    height={30}
    viewBox="0 0 210 210"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
     <title>{"qwantify logo"}</title>
    <defs>
      <linearGradient id="a">
        <stop
          style={{
            stopColor: "#00e1fd",
            stopOpacity: 1,
          }}
          offset={0}
        />
        <stop
          style={{
            stopColor: "#fc007a",
            stopOpacity: 1,
          }}
          offset={1}
        />
      </linearGradient>
      <linearGradient
        xlinkHref="#a"
        id="b"
        x1={14.423}
        y1={176.845}
        x2={155.951}
        y2={-9.054}
        gradientUnits="userSpaceOnUse"
        spreadMethod="pad"
      />
    </defs>
    <path
      style={{
        fill: "none",
        fillOpacity: 1,
        stroke: "url(#b)",
        strokeWidth: 20,
        strokeLinecap: "round",
        strokeOpacity: 1,
      }}
      d="M49.108 62.022c.223-25.513 19.236-46.817 44.23-49.56 24.994-2.744 48.047 13.943 53.627 38.819 5.58 24.875-8.08 50.054-33.833 60.17l-3.969 5.883-3.42 7.228-4.24 16.363-5.05 18.15m-56.426-8.362c-22.206 12.563-50.163 6.75-65.036-13.525-14.873-20.273-11.947-48.581 6.805-65.851 18.753-17.27 47.39-18.03 69.026-.785l7.08.495 7.97-.651 16.29-4.51 18.243-4.702m20.971 53.047c21.983 12.95 30.927 40.068 20.805 63.085-10.12 23.018-36.098 34.638-60.431 27.033-24.333-7.605-39.308-32.025-35.193-59.386l-3.11-6.379-4.55-6.576-12.05-11.853-13.194-13.448"
      className="UnoptimicedTransforms"
      transform="matrix(-.27535 .87361 -.83487 -.26314 220.38 76.36)"
    />
  </svg>
)

export default SvgComponent
