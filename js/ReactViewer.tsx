import { Container, Stage } from "@pixi/react"
import React, { useEffect, useState } from "react"

import { Algo } from "./algo"
import { Camera } from "./camera"
import { DataPointSet } from "./data"
import { MouseHandler } from "./MouseHandler"
import { ProjectedPoints } from "./ProjectedPoints"
import { DataPointId } from "./types"

export const ReactViewer = ({
  dataPointSet,
  setHoveredId,
  stage,
  algo,
  neighbourFrac,
  oldFocusedId,
  setOldFocusedId,
}: {
  dataPointSet: DataPointSet
  setHoveredId: (id: DataPointId) => void
  stage: React.MutableRefObject<Stage>
  embeddingSource?: number
  algo: Algo | null
  neighbourFrac: number
  oldFocusedId: DataPointId | null
  setOldFocusedId: (id: DataPointId | null) => void
}) => {
  const [camera, setCamera] = useState<Camera>(new Camera(stage.current))

  // Every time data changes, reset the camera (points are centered and fill the frame)
  useEffect(() => setCamera((camera) => new Camera(camera.stage)), [dataPointSet])

  return (
    <Container x={0} y={0}>
      <MouseHandler
        setCamera={setCamera}
        tSNESolution={algo !== null ? algo.getSolution() : []}
      />
      <ProjectedPoints
        dataPointSet={dataPointSet}
        algo={algo}
        camera={camera}
        onPointHover={(id) => setHoveredId(id)}
        neighbourFrac={neighbourFrac}
        oldFocusedId={oldFocusedId}
        setOldFocusedId={setOldFocusedId}
      />
    </Container>
  )
}
