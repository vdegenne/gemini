import {readFile} from 'node:fs/promises'
import {askGemini} from './index.js'

const apiKey = (await readFile('.apiKey', 'utf8')).trim()

const {output, previousInteractionId} = await askGemini(
	'Reply with exactly: Gemini works!',
	{
		apiKey,
		model: 'gemini-3.5-flash',
		debug: true,
	},
)

console.log({output, previousInteractionId})
