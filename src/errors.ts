export class RateLimitError extends Error {
	constructor(message = 'Gemini rate limit exceeded') {
		super(message)
		this.name = 'RateLimitError'
	}
}

export class ModelUnavailableError extends Error {
	constructor(
		message = 'Gemini model is no longer available',
		public readonly model?: string,
	) {
		super(message)
		this.name = 'ModelUnavailableError'
	}
}
export class InvalidApiKeyError extends Error {
	constructor(message = 'Invalid Gemini API key') {
		super(message)
		this.name = 'InvalidApiKeyError'
	}
}

export function isRateLimitError(error: unknown): boolean {
	if (!(error instanceof Error)) {
		return false
	}

	return (
		(error as any).status === 429 ||
		(error as any).code === 429 ||
		error.message.toLowerCase().includes('rate limit') ||
		error.message.toLowerCase().includes('quota') ||
		error.message.toLowerCase().includes('resource exhausted')
	)
}

export function isModelUnavailableError(
	error: unknown,
): error is Error & {status?: number; statusCode?: number} {
	if (!(error instanceof Error)) {
		return false
	}

	const status = (error as any).status ?? (error as any).statusCode
	const message = error.message.toLowerCase()

	return (
		status === 404 &&
		message.includes('model') &&
		(message.includes('no longer available') ||
			message.includes('not found') ||
			message.includes('not supported'))
	)
}

export function isInvalidApiKeyError(
	error: unknown,
): error is Error & {status?: number; statusCode?: number} {
	if (!(error instanceof Error)) return false

	const err = error as Error & {
		status?: number
		statusCode?: number
	}

	return (err.status ?? err.statusCode) === 401
}
