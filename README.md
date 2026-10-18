# @vdegenne/gemini

A lightweight TypeScript wrapper around Google's Gemini API, with support for text generation, structured JSON output, system instructions, thinking levels, conversation continuity, and custom errors.

Works in both Node and Browser.

## Installation

```bash
npm install @vdegenne/gemini
```

Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).

## Basic usage

```ts
import {askGemini} from '@vdegenne/gemini'

const {output, previousInteractionId} = await askGemini(
	'Explain closures in JavaScript.',
	{
		apiKey: process.env.GEMINI_API_KEY!,
		model: 'gemini-3.8-flash',
	},
)

console.log(output)
```

`askGemini()` returns an object containing:

- `output`: the generated text, or `undefined` if no output text was returned.
- `previousInteractionId`: the ID of the interaction, which can be used to continue the conversation.

## Options

| Option                  | Type                 | Default    | Description                                                      |
| ----------------------- | -------------------- | ---------- | ---------------------------------------------------------------- |
| `apiKey`                | `string`             | Required   | Your Google Gemini API key.                                      |
| `model`                 | `GeminiModel`        | Required   | The model to use.                                                |
| `systemInstruction`     | `string \| string[]` | —          | System instructions for the model.                               |
| `thinkingLevel`         | `ThinkingLevel`      | `'medium'` | Reasoning effort: `'minimal'`, `'low'`, `'medium'`, or `'high'`. |
| `previousInteractionId` | `string`             | —          | Previous interaction ID for conversation continuity.             |
| `schema`                | `object`             | —          | JSON schema for structured output.                               |
| `debug`                 | `boolean`            | `false`    | Logs request details to the console.                             |

## System instructions

System instructions can be provided as a string or an array of strings. Array entries are trimmed, empty entries are removed, and the remaining instructions are joined with newlines.

```ts
const {output} = await askGemini('Review this code for bugs.', {
	apiKey,
	model: 'gemini-3.8-flash',
	systemInstruction: [
		'You are an experienced TypeScript developer.',
		'Focus on correctness and maintainability.',
	],
	thinkingLevel: 'high',
})
```

## Structured JSON output

Pass a schema to request JSON output. Use `Type` from the package to define the schema.

```ts
import {askGemini, Type} from '@vdegenne/gemini'

type ArticleSuggestion = {
	title: string
	tags: string[]
}

const {output} = await askGemini<ArticleSuggestion>(
	'Suggest a title and tags for an article about TypeScript.',
	{
		apiKey,
		model: 'gemini-3.8-flash',
		schema: {
			type: Type.OBJECT,
			properties: {
				title: {type: Type.STRING},
				tags: {
					type: Type.ARRAY,
					items: {type: Type.STRING},
				},
			},
			required: ['title', 'tags'],
		},
	},
)

console.log(output?.title)
console.log(output?.tags)
```

When a schema is supplied, `output` is typed as the requested generic type. The generic type is a TypeScript annotation; the schema is what instructs the API to return structured JSON.

## Conversation continuity

Pass the previous response's `previousInteractionId` to continue a conversation.

```ts
const first = await askGemini('My project uses TypeScript and Lit.', {
	apiKey,
	model: 'gemini-3.8-flash',
})

const second = await askGemini('What testing framework would suit it?', {
	apiKey,
	model: 'gemini-3.8-flash',
	previousInteractionId: first.previousInteractionId,
})

console.log(second.output)
```

Keep the interaction ID associated with the conversation you want to continue.

## Error handling

The package exports `RateLimitError` and `ModelUnavailableError` for common API failures.

```ts
import {
	askGemini,
	ModelUnavailableError,
	RateLimitError,
} from '@vdegenne/gemini'

try {
	const {output} = await askGemini('Hello!', {
		apiKey,
		model: 'gemini-3.8-flash',
	})

	console.log(output)
} catch (error) {
	if (error instanceof RateLimitError) {
		console.error('Gemini rate limit exceeded.')
	} else if (error instanceof ModelUnavailableError) {
		console.error(`Model unavailable: ${error.model}`)
	} else {
		throw error
	}
}
```

- `RateLimitError`: thrown when the API reports a rate limit or quota error.
- `ModelUnavailableError`: thrown when the API returns a matching model-unavailable error. The original error message is preserved, and `model` identifies the requested model.

Other errors are rethrown unchanged.

## Available models and thinking levels

Import the model and thinking-level lists for runtime inspection:

```ts
import {geminiModels, thinkingLevels} from '@vdegenne/gemini'

console.log(geminiModels)
console.log(thinkingLevels)
```

`GeminiModel` and `ThinkingLevel` are also exported TypeScript types.

The package's curated model list is not a guarantee that every model is available to every API key or supported by every API endpoint. Google may retire models or change availability over time.

## Debugging

Set `debug: true` to log the request input, selected model, thinking level, previous interaction ID, system instruction, and schema.

```ts
await askGemini('Hello!', {
	apiKey,
	model: 'gemini-3.8-flash',
	debug: true,
})
```

Avoid enabling debug logging with sensitive prompts or data, since request contents are printed to the console.
