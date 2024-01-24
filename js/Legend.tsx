// Import any necessary dependencies
import React from "react"

import { ColorLegend } from "./colors"

export const Legend = ({
  colorLegend,
  hueVarName: hue_var_name,
}: {
  colorLegend: ColorLegend | null
  hueVarName?: string
}) => {
  if (colorLegend === null) return null
  return (
    <div>
      <h2
        style={{
          // make title not bold
          fontWeight: "normal",
          fontSize: "1.8em",
        }}
      >
        {hue_var_name}
      </h2>
      <ul
        style={{
          listStyleType: "none" /* Remove bullets */,
          padding: 0 /* Remove padding */,
          margin: 0 /* Remove margins */,
        }}
      >
        {Object.entries(colorLegend).map(([key, color]) => (
          <li key={key} style={{ fontSize: "1.3em" }}>
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                backgroundColor: color.toHexStr() ?? "black",
                marginRight: "5px",
              }}
            ></span>
            {key}
          </li>
        ))}
      </ul>
    </div>
  )
}
