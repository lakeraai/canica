import { Stage } from "@pixi/react"
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { cosine } from "umap-js/dist/umap"

import { Algo } from "./algo"
import { BottomPanel } from "./BottomPanel"
import { DataPointSet } from "./data"
import { ReactViewer } from "./ReactViewer"
import { TSNE } from "./tsne"
import { DataPointId } from "./types"
import { UMAP } from "./umap"

export const renderWidget = ({
  dataPointSet,
  hueVarName = null,
  algoName = "UMAP",
}: {
  dataPointSet: DataPointSet
  hueVarName?: string | null
  algoName?: string
}) => {
  const [hoveredId, setHoveredId] = useState<DataPointId | null>(null)
  const stage = useRef<Stage>(null)
  const [neighbourFrac, setNeighbourFrac] = useState<number>(0)
  const [algo, setAlgo] = useState<Algo | null>(null)
  // We update this dataset with the currently investigated points, so we can select new points and repeat the process endlessly
  const [partialDataPointSet, setPartialDataPointSet] = useState<DataPointSet>(
    new DataPointSet(dataPointSet.dataPoints),
  )
  // Point that was focused before a change (e.g. reset) is stored and used to highlight the same point again
  const [oldFocusedId, setOldFocusedId] = useState<DataPointId | null>(null)

  const setNewDatapointSet = (newDataPointSet: DataPointSet) => {
    if (algo === null) throw new Error("Algo is null")
    setPartialDataPointSet(newDataPointSet)
    setHoveredId(null)
    setAlgo(null)
    // When algorithm is reset, we store the point that was previously highlighted to highlight it again.
    setOldFocusedId(
      algo.focusedIndex !== null
        ? partialDataPointSet.dataPoints[algo.focusedIndex].id
        : null,
    )
  }

  const resetDataPointSet = () =>
    // Start from scratch again (dataPointSet is the original dataset)
    setNewDatapointSet(new DataPointSet(dataPointSet.dataPoints))

  const getNewDataPoints = (dataPointSet: DataPointSet, algo: Algo | null) => {
    if (algo === null) return dataPointSet
    if (algo.neighborhoodIndices === null) return dataPointSet
    return new DataPointSet(
      Array.from(algo.neighborhoodIndices).map((i) => dataPointSet.dataPoints[i]),
    )
  }

  const updateDataPointSet = () =>
    setNewDatapointSet(getNewDataPoints(partialDataPointSet, algo))

  const initAlgo = () => {
    let algoObj: Algo
    if (algoName === "TSNE") {
      algoObj = new TSNE({
        epsilon: 10,
        perplexity: 30,
        dim: 2,
      })
    } else if (algoName === "UMAP") {
      algoObj = new UMAP({ distanceFn: cosine })
    } else throw new Error("Unknown algorithm name: " + algoName)

    const embeddings = partialDataPointSet.dataPoints.map((d) => d.embeddings)

    algoObj.initDataRaw(embeddings)
    algoObj.computeFinalSolution()
    setAlgo(algoObj)
  }

  useEffect(() => {
    if (algo !== null) return
    initAlgo()
  }, [partialDataPointSet.dataPoints, algo])

  return (
    <>
      <Stage
        options={{ backgroundColor: 0xf9f9fa }}
        ref={stage}
        // Setting width and height to 0.67 of the screen size.
        // Adding a max size because of misleading window sizes in VSCode
        width={Math.min(0.67 * window.innerWidth, 1280)} // 1280 ~= 1920 * 0.67
        height={Math.min(0.67 * window.innerHeight, 720)} // 720 ~= 1080 * 0.67
      >
        <ReactViewer
          dataPointSet={partialDataPointSet}
          setHoveredId={setHoveredId}
          // vv: I think this ref can't be null since we're inside the <Stage> tag
          stage={stage as React.MutableRefObject<Stage>}
          algo={algo}
          neighbourFrac={neighbourFrac}
          oldFocusedId={oldFocusedId}
          setOldFocusedId={setOldFocusedId}
        />
      </Stage>

      <BottomPanel
        neighbourFrac={neighbourFrac}
        setNeighbourFrac={setNeighbourFrac}
        dataPointSet={partialDataPointSet}
        updateDataPointSet={updateDataPointSet}
        resetDataPointSet={resetDataPointSet}
        hoveredId={hoveredId}
        hueVarName={hueVarName}
      />
    </>
  )
}
