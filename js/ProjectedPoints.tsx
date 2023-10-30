/**
 * Visualizes the points corresponding to high-dimensional embeddings,
 * as projected onto 2D.
 */
import { Container, Graphics } from "@pixi/react"
import { Graphics as GraphicsType } from "pixi.js"
import * as PIXI from "pixi.js"
import React, { useEffect, useState } from "react"

import { Algo } from "./algo"
import { Camera } from "./camera"
import { DataPointSet } from "./data"
import { DataPointId, Index } from "./types"

const ProjectedPoint = ({
  point,
  onmousedown,
  onmouseenter,
  tsne,
  index,
  color,
  oldFocusedIndex,
}: {
  point: PIXI.Point
  onmousedown: (event: MouseEvent) => void
  onmouseenter: (event: MouseEvent) => void
  tsne: Algo
  index: Index
  color?: number
  oldFocusedIndex: Index | null
}) => {
  // If currently focused or not focused but we know that it was focused before, we paint it
  if (tsne.focusedIndex === index || oldFocusedIndex === index) {
    color = 0xdd8452
  }

  return (
    <Graphics
      draw={(g: GraphicsType) => {
        g.clear()
        let alpha = 1.0
        if (tsne.neighborhoodIndices) {
          alpha = tsne.neighborhoodIndices.has(index) ? 1.0 : 0.2
        }
        g.beginFill(color, alpha)
        g.drawCircle(0, 0, 5)
        g.endFill()
      }}
      x={point.x}
      y={point.y}
      eventMode="dynamic"
      onmousedown={onmousedown}
      onmouseenter={onmouseenter}
    />
  )
}

export const ProjectedPoints = ({
  dataPointSet,
  algo,
  camera,
  onPointHover,
  neighbourFrac,
  oldFocusedId,
  setOldFocusedId,
}: {
  dataPointSet: DataPointSet
  algo: Algo | null
  camera: Camera
  onPointHover: (id: DataPointId) => void
  neighbourFrac: number
  oldFocusedId: DataPointId | null
  setOldFocusedId: (id: DataPointId | null) => void
}) => {
  // If algorithm hasn't been initialized yet, don't render anything
  if (algo === null) return null

  // We need to set a state variable to force a re-render when the focus changes.
  const [focusedIndex, setFocusedIndex] = useState<Index | null>(null)

  const onPointClick = (id: DataPointId) => {
    setFocusedIndex(dataPointSet.idToIndex[id])
    setOldFocusedId(id)
  }

  useEffect(() => {
    window.addEventListener("dblclick", () => {
      algo.neighborhoodIndices = null
      algo.focusedIndex = null
      setFocusedIndex(null)
    })
  }, [])
  const transformMatrix = camera.getTransformMatrix(algo.getSolution())

  algo.focusNeighbours(focusedIndex, neighbourFrac)
  const points = dataPointSet.dataPoints.map((dataPoint, i) => {
    const [x, y] = algo.getSolution()[i]
    const projectedPoint = transformMatrix.apply({ x: x, y: y })
    return (
      <ProjectedPoint
        point={projectedPoint}
        key={i}
        onmousedown={() => onPointClick(dataPoint.id)}
        onmouseenter={() => onPointHover(dataPoint.id)}
        tsne={algo}
        index={i}
        color={dataPoint.color}
        oldFocusedIndex={
          oldFocusedId !== null ? dataPointSet.idToIndex[oldFocusedId] : null
        }
      />
    )
  })

  return <Container>{points}</Container>
}
