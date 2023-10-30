import * as jsonData from "../data/tmp_data.json"

import "./widget.css"

import { getDataPointSet } from "./data"
import { renderWidget } from "./WidgetTools"

const App = () => {
  // Build necessary data structures
  const dataPointSet = getDataPointSet(jsonData)

  return renderWidget({ dataPointSet })
}

export default App
