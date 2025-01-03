import { RequireNonNull, defaultStatusCode } from './utils.js';
export class Form {
    constructor(id, url, method, elements, submitButton, success, statusCode, wrapperId = undefined) {
        this.valid = false;
        this.url = url;
        this.method = method;
        this.form = RequireNonNull.getElementById(id);
        this.elements = elements;
        for (const input of elements)
            input.appendTo(this);
        this.submitButton = submitButton;
        this.submitButton.appendTo(this);
        this.submitButton.addClickListener(() => { this.submit(); });
        this.success = success;
        this.statusCode = statusCode;
        this.wrapper = wrapperId != undefined ? RequireNonNull.getElementById(wrapperId) : undefined;
        this.validate();
    }
    appendChild(node) {
        this.form.appendChild(node);
    }
    validate() {
        this.valid = true;
        for (const input of this.elements) {
            if (input instanceof InputElement)
                this.valid = this.valid && !input.getError();
        }
        this.submitButton.setDisabled(!this.valid);
    }
    async getUrl() {
        return this.url;
    }
    async getData() {
        const data = {};
        for (const input of this.elements) {
            if (input instanceof InputElement)
                data[input.id] = await input.parse();
        }
        return this.method == 'GET' ? data : JSON.stringify(data);
    }
    async submit() {
        const data = await this.getData();
        if (!this.valid)
            return;
        $.ajax({
            url: await this.getUrl(),
            method: this.method,
            data: data,
            contentType: 'application/json',
            success: this.success,
            statusCode: this.statusCode
        });
    }
    show(show) {
        if (this.wrapper != undefined)
            this.wrapper.style.display = show ? '' : 'none';
        else
            this.form.style.display = show ? '' : 'none';
        this.submitButton.show(show);
    }
}
export class Button {
    constructor(text, iconSrc, inFooter = false) {
        this.button = document.createElement('button');
        this.button.innerText = text;
        this.button.disabled = true;
        const icon = document.createElement('img');
        icon.classList.add('button');
        icon.src = iconSrc;
        icon.alt = text + ' Icon';
        this.button.appendChild(icon);
        this.inFooter = inFooter;
    }
    appendTo(formOrSection) {
        if (this.inFooter || formOrSection instanceof HTMLElement)
            formOrSection.appendChild(this.button);
        else {
            const div = document.createElement('div');
            div.classList.add('container');
            div.appendChild(this.button);
            formOrSection.appendChild(div);
        }
    }
    addClickListener(listener) {
        this.button.addEventListener('click', listener);
    }
    setDisabled(disabled) {
        this.button.disabled = disabled;
    }
    isDisabled() {
        return this.button.disabled;
    }
    show(show) {
        this.button.style.display = show ? '' : 'none';
    }
}
export class CancelButton extends Button {
    constructor() {
        super('Cancel', '/img/cancel.svg', true);
        const match = window.location.pathname.match(/(\/[^\/]+)+?/);
        this.addClickListener(() => {
            window.location.href = match != null ? match[1] : '/';
        });
        this.setDisabled(false);
    }
}
export class RedirectButton extends Button {
    constructor(text, iconSrc, url, inFooter = true) {
        super(text, iconSrc, true);
        this.setDisabled(false);
        this.addClickListener(() => {
            window.location.href = url;
        });
        if (inFooter)
            this.appendTo(RequireNonNull.getElementById('footer'));
    }
}
export class ActionButton extends Button {
    constructor(text, iconSrc, feedbackText, action = () => { }) {
        super(text, iconSrc);
        this.feedbackText = feedbackText;
        this.addClickListener(action);
        this.setDisabled(false);
    }
    appendTo(formOrSection) {
        const box = document.createElement('div');
        box.classList.add('box', 'input-feedback');
        const container = document.createElement('div');
        container.classList.add('container');
        container.appendChild(this.button);
        const feedback = document.createElement('span');
        feedback.classList.add('text');
        feedback.innerText = this.feedbackText;
        box.appendChild(container);
        box.appendChild(feedback);
        formOrSection.appendChild(box);
    }
}
export class ApiCallButton extends ActionButton {
    constructor(text, iconSrc, feedbackText, url, success) {
        super(text, iconSrc, feedbackText);
        this.url = url;
        this.success = success;
        this.addClickListener(() => {
            $.ajax({
                url: this.url,
                method: 'POST',
                success: this.success
            });
        });
        this.setDisabled(false);
    }
}
export class StructuredForm extends Form {
    constructor(id, url, method, inputs, submitButton, success, statusCode, wrapperId = undefined, precompile = false) {
        super(id, url, method, inputs, submitButton, success, statusCode, wrapperId);
        this.footer = undefined;
        this.cancelButton = new CancelButton();
        this.cancelButton.appendTo(this);
        if (precompile) {
            new Promise(async (resolve) => {
                $.ajax({
                    url: await this.getUrl(),
                    method: 'GET',
                    success: (res) => {
                        this.precompile(res);
                    },
                    statusCode: defaultStatusCode
                });
            });
        }
    }
    appendChild(node) {
        if (this.footer == undefined)
            this.footer = RequireNonNull.getElementById('footer');
        ;
        if (node instanceof HTMLButtonElement)
            this.footer.appendChild(node);
        else
            super.appendChild(node);
    }
    precompile(res) {
        throw new Error('Method not implemented!');
    }
    show(show) {
        super.show(show);
        this.cancelButton.show(show);
    }
}
export class InfoSpan {
    constructor(labelText) {
        this.labelSpan = document.createElement('span');
        this.labelSpan.classList.add('text');
        this.labelSpan.innerText = labelText;
        this.valueSpan = document.createElement('span');
        this.valueSpan.classList.add('text');
    }
    appendTo(formOrSection) {
        const container = document.createElement('div');
        container.classList.add('container', 'label-input');
        container.appendChild(this.labelSpan);
        container.appendChild(this.valueSpan);
        formOrSection.appendChild(container);
    }
    set(value) {
        this.valueSpan.innerText = value;
    }
}
export class InputElement {
    constructor(id) {
        this.id = id;
    }
    set(value) {
        throw new Error('Method not implemented!');
    }
}
export class Input extends InputElement {
    constructor(id, type, labelText, feedbackText) {
        super(id);
        this.formOrSection = undefined;
        this.timeout = undefined;
        this.error = true;
        this.precompiledValue = undefined;
        this.input = document.createElement('input');
        this.input.id = id;
        this.input.type = type;
        this.feedbackText = feedbackText;
        this.feedback = document.createElement('span');
        this.feedback.classList.add('text');
        this.feedback.innerText = feedbackText;
        this.labelText = labelText;
        this.input.addEventListener('keyup', () => {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.parse();
            }, 1000);
        });
        this.input.addEventListener('keydown', () => {
            clearTimeout(this.timeout);
        });
        this.input.addEventListener('focusout', () => {
            clearTimeout(this.timeout);
            this.parse();
        });
        this.input.addEventListener('change', () => {
            this.parse();
        });
    }
    appendTo(formOrSection) {
        this.formOrSection = formOrSection;
        const box = document.createElement('div');
        box.classList.add('box', 'input-feedback');
        const container = document.createElement('div');
        container.classList.add('container', 'label-input');
        const label = document.createElement('label');
        label.htmlFor = this.id;
        label.innerText = this.labelText;
        container.appendChild(label);
        container.appendChild(this.input);
        box.appendChild(container);
        box.appendChild(this.feedback);
        this.formOrSection.appendChild(box);
        setTimeout(() => {
            if (this.input.value != '')
                this.parse();
        }, 250);
    }
    setError(error, feedbackText) {
        var _a;
        this.error = error;
        if (!this.feedback.classList.contains('error') && !this.feedback.classList.contains('success'))
            this.feedback.classList.add('error');
        if (this.error)
            this.feedback.classList.replace('success', 'error');
        else
            this.feedback.classList.replace('error', 'success');
        this.feedback.innerText = feedbackText;
        (_a = this.formOrSection) === null || _a === void 0 ? void 0 : _a.validate();
    }
    getError() {
        return this.error;
    }
    getInputValue() {
        return this.input.value;
    }
    setInputValue(value) {
        this.input.value = value;
    }
    precompile(value) {
        var _a;
        this.precompiledValue = value;
        this.error = false;
        this.feedback.classList.remove('success', 'error');
        this.feedback.innerText = this.feedbackText;
        switch (typeof value) {
            case 'string':
            case 'number':
                this.setInputValue(value.toString());
        }
        (_a = this.formOrSection) === null || _a === void 0 ? void 0 : _a.validate();
    }
}
export class PasswordInput extends Input {
    constructor(feedbackText = 'Input Password') {
        super('password', 'password', 'Password:', feedbackText);
    }
    async parse() {
        const password = this.getInputValue();
        if (password == this.precompiledValue) {
            this.precompile(password);
            return password;
        }
        if (password.length < 8) {
            this.setError(true, 'At least 8 Characters needed!');
            return undefined;
        }
        let digits = 0, symbols = 0;
        for (let i = 0; i < password.length; i++) {
            const c = password.codePointAt(i);
            if (c == undefined)
                break;
            if (c >= 48 && c <= 57)
                digits++;
            else if ((c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126))
                symbols++;
            else if (!((c >= 97 && c <= 122) || (c >= 65 && c <= 90))) {
                this.setError(true, 'Invalid Character: ' + String.fromCodePoint(c) + '!');
                return undefined;
            }
        }
        if (digits < 2) {
            this.setError(true, 'At least 2 Digits needed!');
            return undefined;
        }
        if (symbols < 1) {
            this.setError(true, 'At least 1 Symbol needed!');
            return undefined;
        }
        this.setError(false, 'Valid Password');
        return password;
    }
    set(value) {
        this.setInputValue(value);
        this.parse();
    }
    changed() {
        return this.input.value != this.precompiledValue;
    }
}
export class StringInput extends Input {
    constructor(id, labelText, feedbackText, minLength = 1, maxLength = 32, allowBulk = false) {
        super(id, 'text', labelText, feedbackText + (allowBulk ? ' (Bulk with \'' + StringInput.bulkSeparator + '\')' : ''));
        this.minLength = minLength;
        this.maxLength = maxLength;
        this.allowBulk = allowBulk;
    }
    getFeedbackText() {
        return this.feedbackText.replace('Input ', '').replace(' (Bulk with \'' + StringInput.bulkSeparator + '\')', '');
    }
    async parse() {
        const value = this.getInputValue();
        if (value == this.precompiledValue) {
            this.precompile(value);
            return value;
        }
        if (value.includes(StringInput.bulkSeparator) && this.allowBulk) {
            for (const title of value.split(StringInput.bulkSeparator)) {
                if (title.length < this.minLength) {
                    this.setError(true, 'Bulk ' + this.getFeedbackText() + ' too short!');
                    return undefined;
                }
                if (title.length > this.maxLength) {
                    this.setError(true, 'Bulk' + this.getFeedbackText() + ' too long!');
                    return undefined;
                }
                this.setError(false, 'Valid Bulk ' + this.getFeedbackText());
                return value;
            }
        }
        if (value.length < this.minLength) {
            this.setError(true, this.getFeedbackText() + ' too short!');
            return undefined;
        }
        if (value.length > this.maxLength) {
            this.setError(true, this.getFeedbackText() + ' too long!');
            return undefined;
        }
        this.setError(false, 'Valid ' + this.getFeedbackText());
        return value;
    }
    set(value) {
        this.setInputValue(value);
        this.parse();
    }
    changed() {
        return this.input.value != this.precompiledValue;
    }
}
StringInput.bulkSeparator = '~';
export class BooleanInput extends InputElement {
    constructor(id, labelText, feedbackText, onSet = async () => { }) {
        super(id);
        this.formOrSection = undefined;
        this.labelText = labelText;
        this.slider = document.createElement('div');
        this.slider.id = this.id;
        this.slider.classList.add('slider', 'off');
        this.slider.addEventListener('click', async () => {
            this.set(!(await this.parse()));
        });
        const sliderCircle = document.createElement('div');
        sliderCircle.classList.add('slider-circle');
        this.slider.appendChild(sliderCircle);
        this.feedback = document.createElement('span');
        this.feedback.classList.add('text');
        this.feedback.innerText = feedbackText;
        this.onSet = onSet;
    }
    appendTo(formOrSection) {
        this.formOrSection = formOrSection;
        const box = document.createElement('div');
        box.classList.add('box', 'input-feedback');
        const container = document.createElement('div');
        container.classList.add('container', 'label-input');
        const label = document.createElement('label');
        label.htmlFor = this.id;
        label.innerText = this.labelText;
        container.appendChild(label);
        container.appendChild(this.slider);
        box.appendChild(container);
        box.appendChild(this.feedback);
        this.formOrSection.appendChild(box);
    }
    getError() {
        return false;
    }
    async parse() {
        return this.slider.classList.contains('on');
    }
    precompile(value) {
        if (value)
            this.slider.classList.replace('off', 'on');
        else
            this.slider.classList.replace('on', 'off');
        this.precompiledValue = value;
    }
    set(value) {
        if (value)
            this.slider.classList.replace('off', 'on');
        else
            this.slider.classList.replace('on', 'off');
        this.onSet(value);
    }
    changed() {
        return this.slider.classList.contains('on') != this.precompiledValue;
    }
}
export class QuantityInput extends Input {
    constructor(id, labelText, feedbackText) {
        super(id, 'number', labelText, feedbackText);
        this.input.classList.add('medium');
    }
    async parse() {
        const quantity = parseInt(this.getInputValue());
        if (quantity == this.precompiledValue) {
            this.precompile(quantity);
            return quantity;
        }
        if (isNaN(quantity)) {
            this.setError(true, this.feedbackText.replace('Input ', '') + ' is not a number!');
            return undefined;
        }
        if (quantity <= 0) {
            this.setError(true, this.feedbackText.replace('Input ', '') + ' must be a positive number!');
            return undefined;
        }
        this.setError(false, 'Valid ' + this.feedbackText.replace('Input ', ''));
        return quantity;
    }
    set(value) {
        this.setInputValue(value.toString());
        this.parse();
    }
    changed() {
        return parseInt(this.input.value) != this.precompiledValue;
    }
}
export class ExpirationInput extends Input {
    constructor(id, labelText, feedbackText) {
        super(id, 'text', labelText, feedbackText + ' ' + ExpirationInput.format);
        this.input.classList.add("date");
    }
    async parse() {
        var _a;
        let expiration = this.input.value;
        if (expiration == this.precompiledValue) {
            this.precompile(expiration);
            return expiration;
        }
        const match = /(\d{4}\/\d{1,2}\/\d{1,2})|((\d{1,2})\/(\d{1,2})\/(?:(\d{4})|(\d{2})))/.exec(expiration);
        if (match == null) {
            this.setError(true, 'Invalid Format!');
            return undefined;
        }
        if (match[1] == undefined)
            expiration = ((_a = match[5]) !== null && _a !== void 0 ? _a : '20' + match[6]) + '/' + match[4] + '/' + match[3];
        const expirationDate = new Date(expiration);
        if (expirationDate.toString() == 'Invalid Date' || isNaN(expirationDate.getTime())) {
            this.setError(true, 'Invalid Date!');
            return undefined;
        }
        this.setError(false, 'Valid ' + this.feedbackText.replace('Input ', '').replace(ExpirationInput.format, ''));
        return expirationDate.getFullYear() + '/' + (expirationDate.getMonth() + 1) + '/' + expirationDate.getDate();
    }
}
ExpirationInput.format = '(YYYY/MM/DD or DD/MM/YY)';
export class ApiFeedbackInput extends Input {
    constructor(id, type, labelText, feedbackText, url) {
        super(id, type, labelText, feedbackText);
        this.url = url;
    }
    set(value) {
        this.setInputValue(value);
        this.parse();
    }
    async parse() {
        const value = this.getInputValue();
        if (value == this.precompiledValue) {
            this.precompile(value);
            return value;
        }
        const data = {};
        data[this.id] = this.getInputValue();
        return new Promise((resolve) => {
            $.ajax({
                url: this.url,
                method: 'GET',
                data: data,
                success: (res) => {
                    this.setError(res.feedback.includes('!'), res.feedback);
                    resolve(this.getInputValue());
                },
                error: (req, err) => {
                    console.error(err);
                    this.setError(true, 'Server unreachable!');
                    resolve(undefined);
                }
            });
        });
    }
}
export class DropdownInput extends InputElement {
    constructor(id, labelText, onSelect) {
        super(id);
        this.labelText = labelText;
        this.onSelect = (value) => {
            if (typeof value == 'string' || typeof value == 'number')
                localStorage.setItem(this.id + '-select', value.toString());
            onSelect(value);
        };
        this.select = document.createElement('select');
        this.select.id = id;
    }
    appendTo(formOrSection) {
        const container = document.createElement('div');
        container.classList.add('container', 'label-input');
        const label = document.createElement('label');
        label.htmlFor = this.id;
        label.innerText = this.labelText;
        this.select.addEventListener('change', async () => {
            this.onSelect(await this.parse());
        });
        container.appendChild(label);
        container.appendChild(this.select);
        formOrSection.appendChild(container);
    }
    async parse() {
        return this.parseValue(this.select.value);
    }
    getError() {
        return false;
    }
    addOption(value, text) {
        const option = document.createElement('option');
        switch (typeof value) {
            case 'string':
            case 'number':
                option.value = value.toString();
        }
        option.innerText = text;
        this.select.appendChild(option);
    }
    precompile(value) {
        for (const option of this.select.childNodes) {
            if (option instanceof HTMLOptionElement)
                option.selected = option.value == value;
        }
        this.onSelect(value);
    }
}
export var UnitOfMeasurement;
(function (UnitOfMeasurement) {
    UnitOfMeasurement["PIECES"] = "PIECES";
    UnitOfMeasurement["GRAMS"] = "GRAMS";
    UnitOfMeasurement["MILLILITERS"] = "MILLILITERS";
})(UnitOfMeasurement || (UnitOfMeasurement = {}));
export class UnitOfMeasurementInput extends DropdownInput {
    constructor(id, labelText) {
        super(id, labelText, () => { });
        this.addOption(UnitOfMeasurement.PIECES, 'pcs');
        this.addOption(UnitOfMeasurement.GRAMS, 'g');
        this.addOption(UnitOfMeasurement.MILLILITERS, 'ml');
        const last = localStorage.getItem(this.id + '-select');
        if (last != null)
            this.precompile(this.parseValue(last));
    }
    parseValue(value) {
        for (const unitOfMeasurement of Object.values(UnitOfMeasurement)) {
            if (unitOfMeasurement == value)
                return unitOfMeasurement;
        }
        return UnitOfMeasurement.PIECES;
    }
}
export class ApiDropdownInput extends DropdownInput {
    constructor(id, labelText, url, onSelect = (id) => { }) {
        super(id, labelText, onSelect);
        this.url = url;
        this.error = true;
    }
    appendTo(formOrSection) {
        const container = document.createElement('div');
        container.classList.add('container', 'label-input');
        formOrSection.appendChild(container);
        $.ajax({
            url: this.url,
            method: 'GET',
            data: {
                order: [{ name: 'asc' }]
            },
            success: (res) => {
                const match = this.url.match(/(?:\/([^\/]+))+?$/);
                if (match == null)
                    return;
                const index = match[1];
                this.error = res[index].length == 0;
                for (const option of res[index]) {
                    this.addOption(option.id, option.name);
                }
                const last = localStorage.getItem(this.id + '-select');
                if (last != null)
                    this.precompile(this.parseValue(last));
                else if (!this.error)
                    this.precompile(res[index][0].id);
                formOrSection.validate();
                const label = document.createElement('label');
                label.htmlFor = this.id;
                label.innerText = this.labelText;
                container.appendChild(label);
                if (this.error) {
                    const create = new RedirectButton('Create ' + this.labelText.replace(':', '').replace('Default ', ''), '/img/create.svg', this.url.replace('/api', '') + '/create');
                    create.appendTo(container);
                }
                else {
                    this.select.addEventListener('change', async () => {
                        this.onSelect(await this.parse());
                    });
                    container.appendChild(this.select);
                }
            },
            error: (req, err) => {
                console.error(err);
            }
        });
    }
    parseValue(value) {
        return parseInt(value);
    }
    getError() {
        return this.error;
    }
}
export class InputSection extends InputElement {
    constructor(title, elements) {
        super('');
        this.form = undefined;
        this.error = true;
        this.title = title;
        this.elements = elements;
        this.section = document.createElement('div');
        this.section.classList.add('box', 'section');
        const h3 = document.createElement('h3');
        h3.innerText = this.title;
        this.section.appendChild(h3);
        for (const input of elements)
            input.appendTo(this);
        this.validate();
    }
    appendChild(node) {
        this.section.appendChild(node);
    }
    appendTo(form) {
        this.form = form;
        form.appendChild(this.section);
    }
    getError() {
        return this.error;
    }
    validate() {
        var _a;
        this.error = false;
        for (const input of this.elements) {
            if (input instanceof InputElement)
                this.error = this.error || input.getError();
        }
        (_a = this.form) === null || _a === void 0 ? void 0 : _a.validate();
    }
}
