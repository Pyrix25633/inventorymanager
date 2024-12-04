import { Button, StructuredForm } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { defaultStatusCode, getParameter } from "./utils.js";
await loadCustomization();
const bookId = getParameter(/^.+\/books\/(\d+)\/delete.*$/);
class DeleteBookForm extends StructuredForm {
    constructor() {
        super('book-delete-form', '/api/books/{bookId}', 'DELETE', [], new Button('Delete', '/img/confirm.svg', true), (res) => {
            window.location.href = '/books';
        }, defaultStatusCode, undefined);
    }
    async getUrl() {
        return this.url.replace('{bookId}', bookId);
    }
}
const deleteBookForm = new DeleteBookForm();
