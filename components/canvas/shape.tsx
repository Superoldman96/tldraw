import React, { useCallback, useRef, memo } from "react"
import state, { useSelector } from "state"
import inputs from "state/inputs"
import { getShapeUtils } from "lib/shapes"
import styled from "styles"

function Shape({ id }: { id: string }) {
  const rGroup = useRef<SVGGElement>(null)

  const isHovered = useSelector((state) => state.data.hoveredId === id)
  const isSelected = useSelector((state) => state.values.selectedIds.has(id))

  const shape = useSelector(
    ({ data }) => data.document.pages[data.currentPageId].shapes[id]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      rGroup.current.setPointerCapture(e.pointerId)
      state.send("POINTED_SHAPE", inputs.pointerDown(e, id))
    },
    [id]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      rGroup.current.releasePointerCapture(e.pointerId)
      state.send("STOPPED_POINTING", inputs.pointerUp(e))
    },
    [id]
  )

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent) => {
      state.send("HOVERED_SHAPE", inputs.pointerEnter(e, id))
    },
    [id, shape]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      state.send("MOVED_OVER_SHAPE", inputs.pointerEnter(e, id))
    },
    [id, shape]
  )

  const handlePointerLeave = useCallback(
    () => state.send("UNHOVERED_SHAPE", { target: id }),
    [id]
  )

  return (
    <StyledGroup
      ref={rGroup}
      isHovered={isHovered}
      isSelected={isSelected}
      transform={`translate(${shape.point})`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      <defs>{getShapeUtils(shape).render(shape)}</defs>
      <HoverIndicator as="use" xlinkHref={"#" + id} />
      <use xlinkHref={"#" + id} {...shape.style} />
      <Indicator as="use" xlinkHref={"#" + id} />
    </StyledGroup>
  )
}

const Indicator = styled("path", {
  fill: "none",
  stroke: "transparent",
  zStrokeWidth: [1, 1],
  pointerEvents: "none",
  strokeLineCap: "round",
  strokeLinejoin: "round",
})

const HoverIndicator = styled("path", {
  fill: "none",
  stroke: "transparent",
  zStrokeWidth: [8, 4],
  pointerEvents: "all",
  strokeLinecap: "round",
  strokeLinejoin: "round",
})

const StyledGroup = styled("g", {
  [`& ${HoverIndicator}`]: {
    opacity: "0",
  },
  variants: {
    isSelected: {
      true: {
        [`& ${Indicator}`]: {
          stroke: "$selected",
        },
      },
      false: {},
    },
    isHovered: {
      true: {
        [`& ${HoverIndicator}`]: {
          opacity: "1",
          stroke: "$hint",
        },
      },
    },
  },
})

export { Indicator, HoverIndicator }

export default memo(Shape)
