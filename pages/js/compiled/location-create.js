import { ApiFeedbackInput, Button, Form } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { defaultStatusCode } from "./utils.js";
await loadCustomization();
const nameInput = new ApiFeedbackInput('name', 'text', 'Name:', 'Input Location Name', '/api/feedbacks/location-name');
class CreateLocationForm extends Form {
    constructor() {
        super('location-create-form', '/api/locations', 'POST', [
            nameInput
        ], new Button('Create', '/img/confirm.svg'), (res) => {
            window.location.href = '/locations';
        }, defaultStatusCode);
    }
}
const createLocationForm = new CreateLocationForm();
