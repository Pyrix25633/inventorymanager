import { ApiFeedbackInput, Button, StructuredForm } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { Response, defaultStatusCode } from "./utils.js";

await loadCustomization();

const nameInput = new ApiFeedbackInput('name', 'text', 'Name:', 'Input Location Name', '/api/feedbacks/location-name');

class CreateLocationForm extends StructuredForm {
    constructor() {
        super('location-create-form', '/api/locations', 'POST', [
            nameInput
        ], new Button('Create', '/img/confirm.svg', true), (res: Response): void => {
            window.location.href = '/locations';
        }, defaultStatusCode);
    }
}

const createLocationForm = new CreateLocationForm();