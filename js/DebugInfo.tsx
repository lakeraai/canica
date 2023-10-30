import { Text } from "@pixi/react"
import { TextStyle } from "pixi.js"
import React from "react"

/**
 * Shows information intended for developers.
 */
export const DebugInfo = ({ tSNEIteration }: { tSNEIteration: number }) => {
  return (
    <Text
      text={`Iter: ${tSNEIteration}`}
      x={10}
      y={10}
      style={{ fontSize: 15, fill: 0xbbbbbb } as TextStyle}
    />
  )
}
