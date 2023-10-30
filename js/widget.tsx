import "./widget.css"

import { createRender, useModelState } from "@anywidget/react"

import { getDataPointSet } from "./data"
import { InputData } from "./types"
import { renderWidget } from "./WidgetTools"

export const render = createRender(() => {
  // Data coming from the backend.
  const [data] = useModelState<InputData>("data")
  const [hueVarName] = useModelState<string | null>("hue_col_name")
  const [algoName] = useModelState<string>("algo_name")

  // Build necessary data structures
  const dataPointSet = getDataPointSet(data)

  return renderWidget({ dataPointSet, hueVarName, algoName })
})
