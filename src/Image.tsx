import {createSignal} from 'solid-js'

const MIN_ZOOM = 0.25
const MAX_ZOOM = 3
const ZOOM_SPEED = 0.05
const PINCH_SENSITIVITY = 0.5

interface ImageProperties {
	src: () => string
	opacity: () => number
}

export function Image({src, opacity}: ImageProperties) {
	const [scale, setScale] = createSignal(1)
	const [translate, setTranslate] = createSignal({x: 0, y: 0})
	const [isDragging, setIsDragging] = createSignal(false)
	const [dragStart, setDragStart] = createSignal({x: 0, y: 0})
	const [lastPosition, setLastPosition] = createSignal({x: 0, y: 0})

	function startDrag(x: number, y: number) {
		setIsDragging(true)
		setDragStart({x, y})
		setLastPosition(translate())
	}

	function drag(x: number, y: number) {
		if (!isDragging()) {
			return
		}
		const deltaX = x - dragStart().x
		const deltaY = y - dragStart().y
		setTranslate({x: lastPosition().x + deltaX, y: lastPosition().y + deltaY})
	}

	function onWheel(e: WheelEvent) {
		e.preventDefault()
		const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED
		setScale(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale() + delta)))
	}

	function onMouseDown(e: MouseEvent) {
		if (e.button === 0) {
			startDrag(e.clientX, e.clientY)
		}
	}

	function onTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			const touch = e.touches[0]
			if (touch) {
				startDrag(touch.clientX, touch.clientY)
			}
		} else if (e.touches.length === 2) {
			const touch1 = e.touches[0]
			const touch2 = e.touches[1]
			if (touch1 && touch2) {
				const dist = Math.hypot(
					touch1.clientX - touch2.clientX,
					touch1.clientY - touch2.clientY
				)
				setDragStart({x: dist, y: scale()})
			}
		}
	}

	function onMouseMove(e: MouseEvent) {
		drag(e.clientX, e.clientY)
	}

	function onTouchMove(e: TouchEvent) {
		e.preventDefault()
		if (e.touches.length === 1) {
			const touch = e.touches[0]
			if (touch) {
				drag(touch.clientX, touch.clientY)
			}
		} else if (e.touches.length === 2) {
			const touch1 = e.touches[0]
			const touch2 = e.touches[1]
			if (touch1 && touch2) {
				const dist = Math.hypot(
					touch1.clientX - touch2.clientX,
					touch1.clientY - touch2.clientY
				)
				const distanceRatio = dist / dragStart().x
				const scaleChange =
					distanceRatio * PINCH_SENSITIVITY + (1 - PINCH_SENSITIVITY)
				setScale(
					Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, dragStart().y * scaleChange))
				)
			}
		}
	}

	function onMouseUpTouchEnd() {
		setIsDragging(false)
	}

	function calculateTransform() {
		return `translate(calc(-50% + ${translate().x}px), calc(-50% + ${translate().y}px)) scale(${scale()})`
	}

	return (
		<div
			class='overflow-hidden relative w-full h-full cursor-grab active:cursor-grabbing select-none'
			onWheel={onWheel}
			onMouseDown={onMouseDown}
			onTouchStart={onTouchStart}
			onMouseMove={onMouseMove}
			onTouchMove={onTouchMove}
			onMouseUp={onMouseUpTouchEnd}
			onTouchEnd={onMouseUpTouchEnd}
		>
			<img
				src={src()}
				class='absolute top-1/2 left-1/2 pointer-events-none'
				style={{transform: calculateTransform(), opacity: opacity()}}
				draggable={false}
				alt=''
			/>
		</div>
	)
}
