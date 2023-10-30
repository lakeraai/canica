import { Stage } from "@pixi/react"
import * as PIXI from "pixi.js"

import { Point } from "./types"

export const SCROLL_SPEED_COEF = 1.1

const getBoundingBox = (points: Point[], paddingFraction = 0) => {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (let i = 0; i < points.length; i++) {
    minX = Math.min(minX, points[i][0])
    minY = Math.min(minY, points[i][1])
    maxX = Math.max(maxX, points[i][0])
    maxY = Math.max(maxY, points[i][1])
  }
  const paddingX = (maxX - minX) * paddingFraction
  const paddingY = (maxY - minY) * paddingFraction
  minX -= paddingX
  minY -= paddingY
  maxX += paddingX
  maxY += paddingY
  return { minX, minY, maxX, maxY }
}

const getTransformMatrix = (
  points: Point[],
  targetRectangle: PIXI.Rectangle,
  scaleCoef = 0.9,
  center: Point = [0, 0],
) => {
  const { minX, minY, maxX, maxY } = getBoundingBox(points)

  const scaleX = targetRectangle.width / (maxX - minX)
  const scaleY = targetRectangle.height / (maxY - minY)
  const scale = Math.min(scaleX, scaleY) * scaleCoef

  // TODO(vv): If the user hasn't moved the camera, maybe we want to center over the
  // points' center of mass instead of the origin.
  // const pointsCenterX = (minX + maxX) / 2
  // const pointsCenterY = (minY + maxY) / 2

  const offsetX = targetRectangle.width / 2
  const offsetY = targetRectangle.height / 2

  const projection = new PIXI.Matrix()

  projection.setTransform(
    offsetX,
    offsetY,
    center[0], // pointsCenterX,
    center[1], // pointsCenterY,
    scale,
    scale,
    0,
    0,
    0,
  )

  return projection
}

/**
 * Holds the current camera state.
 */
export class Camera {
  readonly stage: Stage
  readonly center: PIXI.Point
  readonly scroll: number

  constructor(stage: Stage, center: PIXI.Point = new PIXI.Point(0, 0), scroll = 0) {
    this.stage = stage
    this.center = center
    this.scroll = scroll
  }

  getTransformMatrix(tsneSolution: Point[]): PIXI.Matrix {
    return getTransformMatrix(
      tsneSolution,
      new PIXI.Rectangle(
        0,
        0,
        this.stage.props.width || 1,
        this.stage.props.height || 1,
      ),
      SCROLL_SPEED_COEF ** this.scroll,
      [this.center.x, this.center.y],
    )
  }
}
