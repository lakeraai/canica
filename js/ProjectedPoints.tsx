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
  const RenderHighlighted = () => {
    // If currently focused or not focused but it was focused before, we draw a circle around it
    if (tsne.focusedIndex === index || oldFocusedIndex === index) {
      return (
        <Graphics
          draw={(g: GraphicsType) => {
            g.clear()
            g.lineStyle(2, color, 1.0)
            g.drawCircle(0, 0, 8)
          }}
          x={point.x}
          y={point.y}
          eventMode="dynamic"
          onmousedown={onmousedown}
          onmouseenter={onmouseenter}
        />
      )
    }
    return null
  }

  return (
    <>
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
      <RenderHighlighted />
    </>
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
