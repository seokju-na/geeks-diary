export abstract class ErrorWithMetadata extends Error {
    public abstract code: string;
    public abstract errorDescription: string;

    protected constructor(public readonly message: string) {
        super(message);
    }
}
