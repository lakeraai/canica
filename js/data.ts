import { Color, getColors } from "./colors"
import { DataPoint, DataPointId, Index, InputData } from "./types"

export class DataPointSet {
  dataPoints: DataPoint[]
  idToIndex: { [key: DataPointId]: Index }

  constructor(data: DataPoint[]) {
    this.dataPoints = data
    this.idToIndex = {}
    this.dataPoints.forEach((dataPoint, index) => {
      this.idToIndex[dataPoint.id] = index
    })

    // If hue_var is null, only one distinct categorical value is present,
    // so one same color is assigned to all points
    const colors: Color[] = getColors(
      this.dataPoints.map((dataPoint) => dataPoint.hue_var),
    )
    this.dataPoints.forEach((dataPoint, index) => {
      dataPoint.color = colors[index].toHex()
    })
  }

  get(id: DataPointId): DataPoint {
    return this.dataPoints[this.idToIndex[id]]
  }
}

export const getDataPointSet = (data: InputData): DataPointSet => {
  const keys = Object.keys(data)

  const rawDataPoints = keys.map((key) => {
    return {
      id: key,
      embeddings: data[key].embedding,
      // Even if hue_var is null, a color will be assigned to the point
      hue_var: data[key].hue_var,
      text: data[key].text,
    }
  })
  return new DataPointSet(rawDataPoints)
}
