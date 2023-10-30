import * as PIXI from "pixi.js"

export type Point = [number, number]

export type Vector = number[]

export type DistanceFn = (u: Vector, v: Vector) => number

export type Index = number

export type DataPointId = string

export type DataPoint = {
  id: DataPointId
  embeddings: Vector
  hue_var: number | string | null
  text: string
  color?: number
}

export type InputData = {
  [key: string]: {
    text: string
    embedding: Vector
    hue_var: number | string | null
  }
}

export const fromPixiPoint = (point: PIXI.Point): Point => {
  return [point.x, point.y]
}

export const toPixiPoint = (point: Point): PIXI.Point => {
  return new PIXI.Point(point[0], point[1])
}
