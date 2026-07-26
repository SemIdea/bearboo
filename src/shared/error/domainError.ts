class DomainError<C extends string> extends Error {
	constructor(
		public readonly code: C,
		message?: string,
	) {
		super(message ?? code);
		this.name = "DomainError";
	}
}

export { DomainError };
