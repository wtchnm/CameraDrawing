import {
	createEffect,
	createResource,
	createSignal,
	type JSX,
	Match,
	Show,
	Switch
} from 'solid-js'
import {Image} from './Image'

function requestCameraAccess() {
	return navigator.mediaDevices.getUserMedia({
		video: {
			facingMode: {exact: 'environment'},
			width: {ideal: 4096},
			height: {ideal: 2160}
		},
		audio: false
	})
}

export function App() {
	// biome-ignore lint/suspicious/noUnassignedVariables: assigned by ref
	let videoRef!: HTMLVideoElement
	const [image, setImage] = createSignal<string>()
	const [opacity, setOpacity] = createSignal<number>(0.3)
	const [mediaStream] = createResource(requestCameraAccess)

	createEffect(() => {
		if (mediaStream.latest) {
			videoRef.srcObject = mediaStream.latest
		}
	})

	const onFileChange: JSX.ChangeEventHandlerUnion<
		HTMLInputElement,
		Event
	> = event => {
		const file = event.currentTarget.files?.[0]
		if (file) {
			setImage(URL.createObjectURL(file))
		}
	}

	const onOpacityInput: JSX.InputEventHandlerUnion<
		HTMLInputElement,
		InputEvent
	> = event => {
		setOpacity(event.target.valueAsNumber)
	}

	return (
		<main class='flex h-dvh items-center justify-center bg-black text-white text-xl'>
			<Switch fallback={<p>Requesting camera access...</p>}>
				<Match when={mediaStream.error}>
					<p>You must grant camera access to continue.</p>
				</Match>
				<Match when={mediaStream.latest}>
					<video
						autoplay={true}
						class='h-full'
						muted={true}
						playsinline={true}
						ref={videoRef}
					/>
					<div class='absolute inset-0 z-10 flex h-full flex-col items-center justify-end gap-1'>
						<Show when={image()}>
							{src => <Image opacity={opacity} src={src} />}
						</Show>
						<div class='flex w-full items-center justify-center gap-4 bg-black py-2'>
							<label
								class='rounded-md bg-white px-4 py-1 text-base text-black'
								for='file'
							>
								Choose file
							</label>
							<input
								accept='image/*'
								class='hidden file:hidden'
								id='file'
								onChange={onFileChange}
								type='file'
							/>
							<div class='flex flex-col justify-center gap-1'>
								<label class='text-sm' for='opacity'>
									Opacity
								</label>
								<input
									class='slider-thumb:size-4 h-1.5 w-32 cursor-pointer appearance-none rounded-lg bg-white slider-thumb:bg-slate-400'
									id='opacity'
									max={1}
									min={0}
									onInput={onOpacityInput}
									step={0.05}
									type='range'
									value={opacity()}
								/>
							</div>
						</div>
					</div>
				</Match>
			</Switch>
		</main>
	)
}
