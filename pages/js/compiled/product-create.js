import { ApiDropdownInput, ApiFeedbackInput, Button, QuantityInput, StructuredForm, UnitOfMeasurementInput } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { defaultStatusCode } from "./utils.js";
await loadCustomization();
const nameInput = new ApiFeedbackInput('name', 'text', 'Name:', 'Input Product Name', '/api/feedbacks/product-name');
const defaultQuantityInput = new QuantityInput('defaultQuantity', 'Default Quantity', 'Input Quantity');
const defaultUnitOfMeasurementInput = new UnitOfMeasurementInput('defaultUnitOfMeasurement', 'Default Unit of Measurement');
const defaultLocationInput = new ApiDropdownInput('defaultLocationId', 'Default Location:', '/api/locations');
class CreateProductForm extends StructuredForm {
    constructor() {
        super('product-create-form', '/api/products', 'POST', [
            nameInput,
            defaultQuantityInput,
            defaultUnitOfMeasurementInput,
            defaultLocationInput
        ], new Button('Create', '/img/confirm.svg', true), (res) => {
            window.location.href = '/products';
        }, defaultStatusCode);
    }
}
const createProductForm = new CreateProductForm();
