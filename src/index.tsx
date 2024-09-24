import { render } from 'solid-js/web'

import 'the-new-css-reset/css/reset.css'
import './base.css'
import { App } from './App.tsx'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error('Root element not found.')
}

render(
	() => (
		<>
			<App />
		</>
	),
	root!,
)
