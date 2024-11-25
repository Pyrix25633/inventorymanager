import { ApiDropdownInput, ApiFeedbackInput, Button, StructuredForm } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { defaultStatusCode, Response } from "./utils.js";

await loadCustomization();

const nameInput = new ApiFeedbackInput('name', 'text', 'Name:', 'Input Category Name', '/api/feedbacks/category-name');
const defaultLocationInput = new ApiDropdownInput('defaultLocationId', 'Name:', '/api/locations');

class CreateCategoryForm extends StructuredForm {
    constructor() {
        super('category-create-form', '/api/categories', 'POST', [
            nameInput,
            defaultLocationInput
        ], new Button('Create', '/img/confirm.svg', true), (res: Response): void => {
            window.location.href = '/categories';
        }, defaultStatusCode);
    }
}

const createCategoryForm = new CreateCategoryForm();