import { ApiDropdownInput, ApiFeedbackInput, Button, StructuredForm } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { Response, defaultStatusCode, getParameter } from "./utils.js";

await loadCustomization();

const categoryId = getParameter(/^.+\/categories\/(\d+)\/edit.*$/);

const nameInput = new ApiFeedbackInput('name', 'text', 'Name:', 'Input Category Name', '/api/feedbacks/category-name');
const defaultLocationInput = new ApiDropdownInput('defaultLocationId', 'Default Location:', '/api/locations');

class EditCategoryForm extends StructuredForm {
    constructor() {
        super('category-edit-form', '/api/categories/{categoryId}', 'PATCH', [
            nameInput,
            defaultLocationInput
        ], new Button('Edit', '/img/confirm.svg', true), (res: Response): void => {
            window.location.href = '/categories';
        }, defaultStatusCode, undefined, true);
    }

    async getUrl(): Promise<string> {
        return this.url.replace('{categoryId}', categoryId);
    }

    precompile(res: Response): void {
        nameInput.precompile(res.name);
        defaultLocationInput.precompile(res.defaultLocationId);
    }
}

const editCategoryForm = new EditCategoryForm();