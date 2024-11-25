import { ApiDropdownInput, Button, StringInput, StructuredForm } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { defaultStatusCode, Response } from "./utils.js";

await loadCustomization();

const categoryInput = new ApiDropdownInput('categoryId', 'Category:', '/api/categories', (id: number): void => {
    $.ajax({
        url: '/api/categories/' + id,
        method: 'GET',
        contentType: 'application/json',
        success: (res: { defaultLocationId: number; }): void => {
            locationInput.precompile(res.defaultLocationId);
        },
        statusCode: defaultStatusCode
    });
});
const titleInput = new StringInput('title', 'Title:', 'Input Book Title');
const locationInput = new ApiDropdownInput('locationId', 'Location:', '/api/locations');

class CreateBookForm extends StructuredForm {
    constructor() {
        super('book-create-form', '/api/books', 'POST', [
            categoryInput,
            titleInput,
            locationInput
        ], new Button('Create', '/img/confirm.svg', true), (res: Response): void => {
            window.location.href = '/books';
        }, defaultStatusCode);
    }
}

const createBookForm = new CreateBookForm();