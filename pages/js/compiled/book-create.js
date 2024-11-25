import { ApiDropdownInput, Button, StringInput, StructuredForm } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { defaultStatusCode } from "./utils.js";
await loadCustomization();
const categoryInput = new ApiDropdownInput('categoryId', 'Category:', '/api/categories', (id) => {
    $.ajax({
        url: '/api/categories/' + id,
        method: 'GET',
        contentType: 'application/json',
        success: (res) => {
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
        ], new Button('Create', '/img/confirm.svg', true), (res) => {
            window.location.href = '/books';
        }, defaultStatusCode);
    }
}
const createBookForm = new CreateBookForm();
