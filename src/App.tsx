import {
	type JSX,
	Match,
	Show,
	Switch,
	createEffect,
	createResource,
	createSignal
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
		<main class='flex h-dvh items-center justify-center text-white text-xl bg-black'>
			<Switch fallback={<p>Requesting camera access...</p>}>
				<Match when={mediaStream.error}>
					<p>You must grant camera access to continue.</p>
				</Match>
				<Match when={mediaStream.latest}>
					<video
						playsinline={true}
						autoplay={true}
						muted={true}
						ref={videoRef}
						class='h-full'
					/>
					<div class='z-10 absolute inset-0 h-full flex flex-col items-center justify-end gap-1'>
						<Show when={image()}>
							{src => <Image src={src} opacity={opacity} />}
						</Show>
						<div class='bg-black w-full flex justify-center items-center gap-4 py-2'>
							<label
								for='file'
								class='py-1 text-base px-4 bg-white text-black rounded-md'
							>
								Choose file
							</label>
							<input
								type='file'
								id='file'
								accept='image/*'
								class='hidden file:hidden'
								onChange={onFileChange}
							/>
							<div class='flex flex-col gap-1 justify-center'>
								<label for='opacity' class='text-sm'>
									Opacity
								</label>
								<input
									id='opacity'
									type='range'
									min={0}
									max={1}
									step={0.05}
									value={opacity()}
									onInput={onOpacityInput}
									class='h-1.5 bg-white w-32 rounded-lg appearance-none cursor-pointer slider-thumb:bg-slate-400 slider-thumb:size-4'
								/>
							</div>
						</div>
					</div>
				</Match>
			</Switch>
		</main>
	)
}
