import { ApiDropdownInput, Button, ExpirationInput, QuantityInput, StructuredForm, UnitOfMeasurementInput } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { defaultStatusCode } from "./utils.js";
await loadCustomization();
const expirationInput = new ExpirationInput('expiration', 'Expiration:', 'Input Expiration');
const productInput = new ApiDropdownInput('productId', 'Product:', '/api/products', (id) => {
    $.ajax({
        url: '/api/products/' + id,
        method: 'GET',
        contentType: 'application/json',
        success: (res) => {
            quantityInput.precompile(res.defaultQuantity);
            unitOfMeasurementInput.precompile(res.defaultUnitOfMeasurement);
            locationInput.precompile(res.defaultLocationId);
        },
        statusCode: defaultStatusCode
    });
});
const quantityInput = new QuantityInput('quantity', 'Quantity', 'Input Quantity');
const unitOfMeasurementInput = new UnitOfMeasurementInput('unitOfMeasurement', 'Unit of Measurement');
const locationInput = new ApiDropdownInput('locationId', 'Location:', '/api/locations');
class CreateProductForm extends StructuredForm {
    constructor() {
        super('stock-create-form', '/api/stocks', 'POST', [
            expirationInput,
            productInput,
            quantityInput,
            unitOfMeasurementInput,
            locationInput
        ], new Button('Create', '/img/confirm.svg', true), (res) => {
            window.location.href = '/stocks';
        }, defaultStatusCode);
    }
}
const createProductForm = new CreateProductForm();
