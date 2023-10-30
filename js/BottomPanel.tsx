import { Button, Slider, Stack } from "@mui/material"
import * as React from "react"
import { useEffect } from "react"

import { DataPointSet } from "./data"
import { DataPointId } from "./types"

const HoverPanel = ({
  dataPointSet,
  hoveredId,
  hueVarName,
}: {
  dataPointSet: DataPointSet
  hoveredId: DataPointId | null
  hueVarName: string | null
}) => {
  if (hoveredId === null) {
    return <div>Hover over a point to see its text</div>
  }
  const score = dataPointSet.get(hoveredId).hue_var
  return (
    <div>
      {hueVarName && (
        <div>
          {hueVarName} value: {score}
        </div>
      )}
      {dataPointSet.get(hoveredId).text}
    </div>
  )
}

const ControlPanel = ({
  neighbourFrac,
  setNeighbourFrac,
  sizeDataset,
  updateDataPointSet,
  resetDataPointSet,
}: {
  neighbourFrac: number
  setNeighbourFrac: (frac: number) => void
  sizeDataset: number
  updateDataPointSet: () => void
  resetDataPointSet: () => void
}) => {
  const nNeighbours = Math.floor(neighbourFrac * sizeDataset)
  // Default value so that 5-6 neighbours are selected and the number is not weird
  const defaultFraction: number = Math.ceil((5 / sizeDataset) * 100) / 100
  useEffect(() => {
    // This only runs once at the beginning, so it's useful to set NeighbourFrac to a default
    setNeighbourFrac(defaultFraction)
  }, [])

  // _event and is not used, that's why it starts with _ (typechecker likes it)
  const handleChange = (_event: Event, value: number | number[]) => {
    // Signature of expected function by Slider has value as number | number[], but we expect only a number. Throw an error if it's not a number.
    if (typeof value !== "number") throw new Error("value is not a number")
    setNeighbourFrac(value)
  }

  return (
    <>
      <Stack direction="column" spacing={2}>
        <Slider
          marks={false}
          max={1}
          min={0}
          step={1e-6}
          valueLabelDisplay="off"
          defaultValue={defaultFraction}
          onChange={handleChange}
        />
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={updateDataPointSet}>
            Re-plot
          </Button>
          <Button variant="outlined" onClick={resetDataPointSet}>
            Reset
          </Button>
        </Stack>
      </Stack>
      <span style={{ paddingTop: "1em" }}>Selected {nNeighbours} neighbours</span>
    </>
  )
}

export const BottomPanel = ({
  neighbourFrac,
  setNeighbourFrac,
  dataPointSet,
  updateDataPointSet,
  resetDataPointSet,
  hoveredId,
  hueVarName,
}: {
  neighbourFrac: number
  setNeighbourFrac: (frac: number) => void
  dataPointSet: DataPointSet
  updateDataPointSet: () => void
  resetDataPointSet: () => void
  hoveredId: DataPointId | null
  hueVarName: string | null
}) => {
  return (
    <>
      <ControlPanel
        neighbourFrac={neighbourFrac}
        setNeighbourFrac={setNeighbourFrac}
        sizeDataset={dataPointSet.dataPoints.length}
        updateDataPointSet={updateDataPointSet}
        resetDataPointSet={resetDataPointSet}
      />

      <HoverPanel
        dataPointSet={dataPointSet}
        hoveredId={hoveredId}
        hueVarName={hueVarName}
      />
    </>
  )
}
