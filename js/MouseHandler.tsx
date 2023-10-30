/**
 * Handles mouse events for the PIXI stage.
 * Based loosely on https://github.com/Mwni/pixi-mousewheel.
 */
import { Container } from "@pixi/react"
import * as PIXI from "pixi.js"
import React, { useCallback, useEffect, useState } from "react"

import { Camera, SCROLL_SPEED_COEF } from "./camera"
import { Point } from "./types"

export type ScrollState = { scroll: number; offsetX: number; offsetY: number }

export const MouseHandler = ({
  setCamera,
  tSNESolution,
}: {
  setCamera: React.Dispatch<React.SetStateAction<Camera>>
  tSNESolution: Point[]
}) => {
  // useEffect is called when the component is rendered, but only once (since we don't
  // declare any dependencies). We do this because we only need to add
  // the event listener once.
  // Handles double click to reset camera
  useEffect(() => {
    const handleDblClick = () =>
      setCamera((camera) => {
        // Reset to default camera
        return new Camera(camera.stage)
      })

    window.addEventListener("dblclick", handleDblClick)
  }, [])

  const [isDragging, setIsDragging] = useState(false)

  // useCallback is used to memoize the function, so that it doesn't get recreated
  // on every render.
  const onDown = useCallback(() => setIsDragging(true), [])
  const onUp = useCallback(() => setIsDragging(false), [])

  // Handles frame movement to explore the points
  const onMove = useCallback(
    (e: PIXI.FederatedMouseEvent) => {
      if (isDragging) {
        setCamera((camera) => {
          const transformMatrix = camera.getTransformMatrix(tSNESolution)

          // The transform matrix also has a translation element.
          // Get rid of it by subtracting the movement origin.
          const movement = transformMatrix.applyInverse({
            x: e.movement.x,
            y: e.movement.y,
          })
          const movementOrigin = transformMatrix.applyInverse({
            x: 0,
            y: 0,
          })

          const center = new PIXI.Point(
            camera.center.x - (movement.x - movementOrigin.x),
            camera.center.y - (movement.y - movementOrigin.y),
          )
          return new Camera(camera.stage, center, camera.scroll)
        })
      }
    },
    [isDragging, setCamera, tSNESolution],
  )

  // Only handle scroll events on the canvas. All other scroll events should scroll the
  // page. When inside of the canvas we zoom the canvas instead.
  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      if (!(e.srcElement instanceof HTMLCanvasElement)) return
      e.preventDefault()
    }
    window.addEventListener("wheel", preventScroll, { passive: false })
  }, [])

  // Handles zooming in and out when scrolling
  const onScroll = useCallback(
    (e: PIXI.FederatedWheelEvent) => {
      setCamera((camera) => {
        const delta = e.deltaY * -0.1

        const transformMatrix = camera.getTransformMatrix(tSNESolution)

        const dataCoordinates = transformMatrix.applyInverse({
          x: e.global.x,
          y: e.global.y,
        })

        const scrollCenter = new PIXI.Point(
          dataCoordinates.x -
            (dataCoordinates.x - camera.center.x) * SCROLL_SPEED_COEF ** -delta,
          dataCoordinates.y -
            (dataCoordinates.y - camera.center.y) * SCROLL_SPEED_COEF ** -delta,
        )

        return new Camera(camera.stage, scrollCenter, camera.scroll + delta)
      })
    },
    [tSNESolution],
  )

  return (
    <Container
      onmousedown={onDown}
      onmouseup={onUp}
      onmouseupoutside={onUp}
      onmousemove={onMove}
      onwheel={onScroll}
      hitArea={new PIXI.Rectangle(0, 0, 10000, 10000)}
      eventMode="dynamic"
    />
  )
}
