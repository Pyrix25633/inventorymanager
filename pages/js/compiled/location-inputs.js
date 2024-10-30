export class NameInput extends Input {
    constructor() {
        super('name', 'text', 'Name:', 'Input Chat Name');
    }
    async parse() {
        const status = this.getInputValue();
        if (status == this.precompiledValue) {
            this.precompile(status);
            return status;
        }
        if (status.length < 3) {
            this.setError(true, 'Chat Name too short!');
            return undefined;
        }
        if (status.length > 64) {
            this.setError(true, 'Chat Name too long!');
            return undefined;
        }
        this.setError(false, 'Valid Chat Name');
        return status;
    }
}
