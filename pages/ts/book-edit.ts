import { ApiDropdownInput, Button, StringInput, StructuredForm } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { Response, defaultStatusCode, getParameter } from "./utils.js";

await loadCustomization();

const bookId = getParameter(/^.+\/books\/(\d+)\/edit.*$/);

const categoryInput = new ApiDropdownInput('categoryId', 'Category:', '/api/categories', (id: number): void => {
    $.ajax({
        url: '/api/categories/' + id,
        method: 'GET',
        contentType: 'application/json',
        success: (res: Response): void => {
            locationInput.precompile(res.defaultLocationId);
        },
        statusCode: defaultStatusCode
    });
});
const titleInput = new StringInput('title', 'Title:', 'Input Book Title');
const locationInput = new ApiDropdownInput('locationId', 'Location:', '/api/locations');

class EditBookForm extends StructuredForm {
    constructor() {
        super('book-edit-form', '/api/books/{bookId}', 'PATCH', [
            categoryInput,
            titleInput,
            locationInput
        ], new Button('Edit', '/img/confirm.svg', true), (res: Response): void => {
            window.location.href = '/books';
        }, defaultStatusCode, undefined, true);
    }

    async getUrl(): Promise<string> {
        return this.url.replace('{bookId}', bookId);
    }

    precompile(res: Response): void {
        categoryInput.precompile(res.categoryId);
        titleInput.precompile(res.title);
        locationInput.precompile(res.locationId);
    }
}

const editCategoryForm = new EditBookForm();