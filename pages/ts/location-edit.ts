import { ApiFeedbackInput, Button, StructuredForm } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { Response, defaultStatusCode, getParameter } from "./utils.js";

await loadCustomization();

const locationId = getParameter(/^.+\/locations\/(\d+)\/edit.*$/);

const nameInput = new ApiFeedbackInput('name', 'text', 'Name:', 'Input Location Name', '/api/feedbacks/location-name');

class EditLocationForm extends StructuredForm {
    constructor() {
        super('location-edit-form', '/api/locations/{locationId}', 'PATCH', [
            nameInput
        ], new Button('Edit', '/img/confirm.svg', true), (res: Response): void => {
            window.location.href = '/locations';
        }, defaultStatusCode, undefined, true);
    }

    async getUrl(): Promise<string> {
        return this.url.replace('{locationId}', locationId);
    }

    precompile(res: Response): void {
        nameInput.precompile(res.name);
    }
}

const editLocationForm = new EditLocationForm();