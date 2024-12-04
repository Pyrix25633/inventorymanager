import { RequireNonNull, StatusCode, Success, defaultStatusCode } from './utils.js';

type JsonObject = { [index: string]: any; };

export interface FormAppendable {
    appendTo(formOrSection: Form | InputSection): void;
}

export abstract class Form {
    protected readonly url: string;
    private readonly method: string;
    private readonly form: HTMLElement;
    private readonly elements: FormAppendable[];
    private readonly submitButton: Button;
    private readonly success: Success;
    private readonly statusCode: StatusCode;
    private readonly wrapper: HTMLDivElement | undefined;
    private valid: boolean = false;

    constructor(id: string, url: string, method: string, elements: FormAppendable[], submitButton: Button,
                success: Success, statusCode: StatusCode, wrapperId: string| undefined = undefined) {
        this.url = url;
        this.method = method;
        this.form = RequireNonNull.getElementById(id);
        this.elements = elements;
        for(const input of elements)
            input.appendTo(this);
        this.submitButton = submitButton;
        this.submitButton.appendTo(this);
        this.submitButton.addClickListener((): void => { this.submit(); });
        this.success = success;
        this.statusCode = statusCode;
        this.wrapper = wrapperId != undefined ? RequireNonNull.getElementById(wrapperId) as HTMLDivElement : undefined;
        this.validate();
    }

    appendChild(node: HTMLElement): void {
        this.form.appendChild(node);
    }

    validate(): void {
        this.valid = true;
        for(const input of this.elements) {
            if(input instanceof InputElement)
                this.valid = this.valid && !input.getError();
        }
        this.submitButton.setDisabled(!this.valid);
    }

    async getUrl(): Promise<string> {
        return this.url;
    }

    async getData(): Promise<string | JsonObject> {
        const data: { [index: string]: any } = {};
        for(const input of this.elements) {
            if(input instanceof InputElement)
                data[input.id] = await input.parse();
        }
        return this.method == 'GET' ? data : JSON.stringify(data);
    }

    async submit(): Promise<void> {
        const data = await this.getData();
        if(!this.valid) return;
        $.ajax({
            url: await this.getUrl(),
            method: this.method,
            data: data,
            contentType: 'application/json',
            success: this.success,
            statusCode: this.statusCode
        });
    }

    show(show: boolean): void {
        if(this.wrapper != undefined)
            this.wrapper.style.display = show ? '' : 'none';
        else
            this.form.style.display = show ? '' : 'none';
        this.submitButton.show(show);
    }
}

export class Button implements FormAppendable {
    protected readonly button: HTMLButtonElement;
    private readonly inFooter: boolean;

    constructor(text: string, iconSrc: string, inFooter: boolean = false) {
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

    appendTo(formOrSection: Form | InputSection | HTMLElement) {
        if(this.inFooter || formOrSection instanceof HTMLElement)
            formOrSection.appendChild(this.button);
        else {
            const div = document.createElement('div');
            div.classList.add('container');
            div.appendChild(this.button);
            formOrSection.appendChild(div);
        }
    }

    addClickListener(listener: () => void): void {
        this.button.addEventListener('click', listener);
    }

    setDisabled(disabled: boolean): void {
        this.button.disabled = disabled;
    }

    isDisabled(): boolean {
        return this.button.disabled;
    }

    show(show: boolean): void {
        this.button.style.display = show ? '' : 'none';
    }
}

export class CancelButton extends Button {
    constructor() {
        super('Cancel', '/img/cancel.svg', true);
        const match = window.location.pathname.match(/(\/[^\/]+)+?/);
        this.addClickListener((): void => {
            window.location.href = match != null ? match[1] : '/';
        });
        this.setDisabled(false);
    }
}

export class RedirectButton extends Button {
    constructor(text: string, iconSrc: string, url: string, inFooter: boolean = true) {
        super(text, iconSrc, true);
        this.setDisabled(false);
        this.addClickListener(() => {
            window.location.href = url;
        });
        if(inFooter)
            this.appendTo(RequireNonNull.getElementById('footer'));
    }
}

export type Action = () => void;

export class ActionButton extends Button {
    private readonly feedbackText: string;

    constructor(text: string, iconSrc: string, feedbackText: string, action: Action = () => {}) {
        super(text, iconSrc);
        this.feedbackText = feedbackText;
        this.addClickListener(action);
        this.setDisabled(false);
    }

    appendTo(formOrSection: Form | InputSection) {
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
    private readonly url: string;
    private success: Success;

    constructor(text: string, iconSrc: string, feedbackText: string, url: string, success: Success) {
        super(text, iconSrc, feedbackText);
        this.url = url;
        this.success = success;
        this.addClickListener((): void => {
            $.ajax({
                url: this.url,
                method: 'POST',
                success: this.success
            });
        });
        this.setDisabled(false);
    }
}

export abstract class StructuredForm extends Form {
    private footer: HTMLDivElement | undefined = undefined;
    private readonly cancelButton: Button;

    constructor(id: string, url: string, method: string, inputs: InputElement<any>[], submitButton: Button,
                success: Success, statusCode: StatusCode, wrapperId: string | undefined = undefined, precompile: boolean = false) {
        super(id, url, method, inputs, submitButton, success, statusCode, wrapperId);
        this.cancelButton = new CancelButton();
        this.cancelButton.appendTo(this);
        if(precompile) {
            new Promise<void>(async (resolve: () => void): Promise<void> => {
                $.ajax({
                    url: await this.getUrl(),
                    method: 'GET',
                    success: (res: Response): void => {
                        this.precompile(res);
                    },
                    statusCode: defaultStatusCode
                });
            });
        }
    }

    appendChild(node: HTMLElement): void {
        if(this.footer == undefined)
            this.footer = RequireNonNull.getElementById('footer') as HTMLDivElement;;
        if(node instanceof HTMLButtonElement)
            this.footer.appendChild(node);
        else
            super.appendChild(node);
    }

    precompile(res: Response): void {
        throw new Error('Method not implemented!')
    }

    show(show: boolean): void {
        super.show(show);
        this.cancelButton.show(show);
    }
}

export class InfoSpan implements FormAppendable {
    private readonly labelSpan: HTMLSpanElement;
    private readonly valueSpan: HTMLSpanElement;

    constructor(labelText: string) {
        this.labelSpan = document.createElement('span');
        this.labelSpan.classList.add('text');
        this.labelSpan.innerText = labelText;
        this.valueSpan = document.createElement('span');
        this.valueSpan.classList.add('text');
    }

    appendTo(formOrSection: Form | InputSection): void {
        const container = document.createElement('div');
        container.classList.add('container', 'label-input');
        container.appendChild(this.labelSpan);
        container.appendChild(this.valueSpan);
        formOrSection.appendChild(container);
    }

    set(value: string): void {
        this.valueSpan.innerText = value;
    }
}

export abstract class InputElement<T> implements FormAppendable {
    public readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    abstract appendTo(formOrSection: Form | InputSection): void;

    set(value: T): void {
        throw new Error('Method not implemented!');
    }

    abstract parse(): Promise<T | undefined>;

    abstract getError(): boolean;
}

export abstract class Input<T> extends InputElement<T> {
    private formOrSection: Form | InputSection | undefined = undefined;
    public readonly input: HTMLInputElement;
    private readonly labelText: string;
    protected readonly feedbackText: string;
    private readonly feedback: HTMLSpanElement;
    private timeout: NodeJS.Timeout | undefined = undefined;
    private error: boolean = true;
    protected precompiledValue: T | undefined = undefined;

    constructor(id: string, type: string, labelText: string, feedbackText: string) {
        super(id);
        this.input = document.createElement('input');
        this.input.id = id;
        this.input.type = type;
        this.feedbackText = feedbackText;
        this.feedback = document.createElement('span');
        this.feedback.classList.add('text');
        this.feedback.innerText = feedbackText;
        this.labelText = labelText;
        this.input.addEventListener('keyup', (): void => {
            clearTimeout(this.timeout);
            this.timeout = setTimeout((): void => {
                this.parse();
            }, 1000);
        });
        this.input.addEventListener('keydown', (): void => {
            clearTimeout(this.timeout);
        });
        this.input.addEventListener('focusout', (): void => {
            clearTimeout(this.timeout);
            this.parse();
        });
        this.input.addEventListener('change', (): void => {
            this.parse();
        });
    }

    appendTo(formOrSection: Form | InputSection): void {
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
        setTimeout((): void => {
            if(this.input.value != '') this.parse();
        }, 250);
    }

    setError(error: boolean, feedbackText: string): void {
        this.error = error;
        if(!this.feedback.classList.contains('error') && !this.feedback.classList.contains('success'))
            this.feedback.classList.add('error');
        if(this.error)
            this.feedback.classList.replace('success', 'error');
        else
            this.feedback.classList.replace('error', 'success');
        this.feedback.innerText = feedbackText;
        this.formOrSection?.validate();
    }

    getError(): boolean {
        return this.error;
    }

    getInputValue(): string {
        return this.input.value;
    }

    setInputValue(value: string): void {
        this.input.value = value;
    }

    precompile(value: T): void {
        this.precompiledValue = value;
        this.error = false;
        this.feedback.classList.remove('success', 'error');
        this.feedback.innerText = this.feedbackText;
        switch(typeof value) {
            case 'string':
            case 'number':
                this.setInputValue(value.toString());
        }
        this.formOrSection?.validate();
    }
}

export class PasswordInput extends Input<string> {
    constructor(feedbackText: string = 'Input Password') {
        super('password', 'password', 'Password:', feedbackText);
    }

    async parse(): Promise<string | undefined> {
        const password = this.getInputValue();
        if(password == this.precompiledValue) {
            this.precompile(password);
            return password;
        }
        if(password.length < 8) {
            this.setError(true, 'At least 8 Characters needed!');
            return undefined;
        }
        let digits = 0, symbols = 0;
        for(let i = 0; i < password.length; i++) {
            const c: number | undefined = password.codePointAt(i);
            if(c == undefined) break;
            if(c >= 48 && c <= 57) digits++;
            else if((c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126)) symbols++;
            else if(!((c >= 97 && c <= 122) || (c >= 65 && c <= 90))) {
                this.setError(true, 'Invalid Character: ' + String.fromCodePoint(c) + '!');
                return undefined;
            }
        }
        if(digits < 2) {
            this.setError(true, 'At least 2 Digits needed!');
            return undefined;
        }
        if(symbols < 1) {
            this.setError(true, 'At least 1 Symbol needed!');
            return undefined;
        }
        this.setError(false, 'Valid Password');
        return password;
    }

    set(value: string): void {
        this.setInputValue(value);
        this.parse();
    }

    changed(): boolean {
        return this.input.value != this.precompiledValue;
    }
}

export class StringInput extends Input<string> {
    private readonly minLength: number;
    private readonly maxLength: number;

    constructor(id: string, labelText: string, feedbackText: string, minLength: number = 1, maxLength: number = 32) {
        super(id, 'text', labelText, feedbackText);
        this.minLength = minLength;
        this.maxLength = maxLength;
    }

    async parse(): Promise<string | undefined> {
        const value = this.getInputValue();
        if(value == this.precompiledValue) {
            this.precompile(value);
            return value;
        }
        if(value.length < this.minLength) {
            this.setError(true, this.feedbackText.replace('Input ', '') + ' too short!');
            return undefined;
        }
        if(value.length > this.maxLength) {
            this.setError(true, this.feedbackText.replace('Input ', '') + ' too long!');
            return undefined;
        }
        this.setError(false, 'Valid ' + this.feedbackText.replace('Input ', ''));
        return value;
    }

    set(value: string): void {
        this.setInputValue(value);
        this.parse();
    }

    changed(): boolean {
        return this.input.value != this.precompiledValue;
    }
}

type OnSet = (value: boolean) => Promise<void>;

export class BooleanInput extends InputElement<boolean> {
    private readonly labelText: string;
    private readonly slider: HTMLDivElement;
    private readonly feedback: HTMLSpanElement;
    private formOrSection: Form | InputSection | undefined = undefined;
    private precompiledValue: boolean | undefined;
    private onSet: OnSet;

    constructor(id: string, labelText: string, feedbackText: string, onSet: OnSet = async (): Promise<void> => {}) {
        super(id);
        this.labelText = labelText;
        this.slider = document.createElement('div');
        this.slider.id = this.id;
        this.slider.classList.add('slider', 'off');
        this.slider.addEventListener('click', async (): Promise<void> => {
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

    appendTo(formOrSection: Form | InputSection): void {
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

    getError(): boolean {
        return false;
    }

    async parse(): Promise<boolean> {
        return this.slider.classList.contains('on');
    }

    precompile(value: boolean): void {
        if(value)
            this.slider.classList.replace('off', 'on');
        else
            this.slider.classList.replace('on', 'off');
        this.precompiledValue = value;
    }

    set(value: boolean): void {
        if(value)
            this.slider.classList.replace('off', 'on');
        else
            this.slider.classList.replace('on', 'off');
        this.onSet(value);
    }

    changed(): boolean {
        return this.slider.classList.contains('on') != this.precompiledValue;
    }
}

export class QuantityInput extends Input<number> {
    constructor(id: string, labelText: string, feedbackText: string) {
        super(id, 'number', labelText, feedbackText);
        this.input.classList.add('medium');
    }

    async parse(): Promise<number | undefined> {
        const quantity: number = parseInt(this.getInputValue());
        if(quantity == this.precompiledValue) {
            this.precompile(quantity);
            return quantity;
        }
        if(isNaN(quantity)) {
            this.setError(true, this.feedbackText.replace('Input ', '') + ' is not a number!');
            return undefined;
        }
        if(quantity <= 0) {
            this.setError(true, this.feedbackText.replace('Input ', '') + ' must be a positive number!');
            return undefined;
        }
        this.setError(false, 'Valid ' + this.feedbackText.replace('Input ', ''));
        return quantity;
    }

    set(value: number): void {
        this.setInputValue(value.toString());
        this.parse();
    }

    changed(): boolean {
        return parseInt(this.input.value) != this.precompiledValue;
    }
}

export class ExpirationInput extends Input<string> {
    private static readonly format: string = '(YYYY/MM/DD)';

    constructor(id: string, labelText: string, feedbackText: string) {
        super(id, 'text', labelText, feedbackText + ' ' + ExpirationInput.format);
        this.input.classList.add("date");
    }

    async parse(): Promise<string | undefined> {
        const expiration: string = this.input.value;
        if(expiration == this.precompiledValue) {
            this.precompile(expiration);
            return expiration;
        }
        const tokenExpirationMatch = expiration.match(/\d{4}\/\d{1,2}\/\d{1,2}/);
        const tokenExpirationDate = new Date(expiration);
        if(tokenExpirationMatch == null || tokenExpirationDate.toString() == 'Invalid Date' || isNaN(tokenExpirationDate.getTime())) {
            this.setError(true, 'Invalid ' + this.feedbackText.replace('Input ', '').replace(ExpirationInput.format, ''));
            return undefined;
        }
        this.setError(false, 'Valid ' + this.feedbackText.replace('Input ', '').replace(ExpirationInput.format, ''));
        return expiration;
    }
}

export class ApiFeedbackInput extends Input<string> {
    private readonly url: string;

    constructor(id: string, type: string, labelText: string, feedbackText: string, url: string) {
        super(id, type, labelText, feedbackText);
        this.url = url;
    }

    set(value: string): void {
        this.setInputValue(value);
        this.parse();
    }

    async parse(): Promise<string | undefined> {
        const value = this.getInputValue()
        if(value == this.precompiledValue) {
            this.precompile(value);
            return value;
        }
        const data: { [index: string]: any; } = {};
        data[this.id] = this.getInputValue();
        return new Promise((resolve): void => {
            $.ajax({
                url: this.url,
                method: 'GET',
                data: data,
                success: (res: { feedback: string; }) => {
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

type OnSelect<T> = (value: T) => void;

export abstract class DropdownInput<T> extends InputElement<T> {
    protected readonly select: HTMLSelectElement;
    protected readonly labelText: string;
    protected readonly onSelect: OnSelect<T>;

    constructor(id: string, labelText: string, onSelect: OnSelect<T>) {
        super(id);
        this.labelText = labelText;
        this.onSelect = (value: T): void => {
            if(typeof value == 'string' || typeof value == 'number')
                localStorage.setItem(this.id + '-select', value.toString());
            onSelect(value);
        };
        this.select = document.createElement('select');
        this.select.id = id;
    }

    appendTo(formOrSection: Form | InputSection): void {
        const container = document.createElement('div');
        container.classList.add('container', 'label-input');
        const label = document.createElement('label');
        label.htmlFor = this.id;
        label.innerText = this.labelText;
        this.select.addEventListener('change', async (): Promise<void> => {
            this.onSelect(await this.parse());
        });
        container.appendChild(label);
        container.appendChild(this.select);
        formOrSection.appendChild(container);
    }

    abstract parseValue(value: string): T;

    async parse(): Promise<T> {
        return this.parseValue(this.select.value);
    }

    getError(): boolean {
        return false;
    }

    addOption(value: T, text: string): void {
        const option: HTMLOptionElement = document.createElement('option');
        switch(typeof value) {
            case 'string':
            case 'number':
                option.value = value.toString();
        }
        option.innerText = text;
        this.select.appendChild(option);
    }

    precompile(value: T): void {
        for(const option of this.select.childNodes) {
            if(option instanceof HTMLOptionElement)
                option.selected = option.value == value;
        }
        this.onSelect(value);
    }
}

export enum UnitOfMeasurement {
    PIECES = 'PIECES',
    GRAMS = 'GRAMS',
    MILLILITERS = 'MILLILITERS'
}

export class UnitOfMeasurementInput extends DropdownInput<UnitOfMeasurement> {
    constructor(id: string, labelText: string) {
        super(id, labelText, (): void => {});
        this.addOption(UnitOfMeasurement.PIECES, 'pcs');
        this.addOption(UnitOfMeasurement.GRAMS, 'g');
        this.addOption(UnitOfMeasurement.MILLILITERS, 'ml');
        const last: string | null = localStorage.getItem(this.id + '-select');
        if(last != null)
            this.precompile(this.parseValue(last));
    }

    parseValue(value: string): UnitOfMeasurement {
        for(const unitOfMeasurement of Object.values(UnitOfMeasurement)) {
            if(unitOfMeasurement == value)
                return unitOfMeasurement;
        }
        return UnitOfMeasurement.PIECES;
    }
}

export class ApiDropdownInput extends DropdownInput<number> {
    private readonly url: string;
    private error: boolean;

    constructor(id: string, labelText: string, url: string, onSelect: OnSelect<number> = (id: number): void => {}) {
        super(id, labelText, onSelect);
        this.url = url;
        this.error = true;
    }

    appendTo(formOrSection: Form | InputSection): void {
        const container = document.createElement('div');
        container.classList.add('container', 'label-input');
        formOrSection.appendChild(container);
        $.ajax({
            url: this.url,
            method: 'GET',
            data: {
                order: [ { name: 'asc' } ]
            },
            success: (res: { [index: string]: { id: number; name: string; }[] }) => {
                const match = this.url.match(/(?:\/([^\/]+))+?$/);
                if(match == null)
                    return;
                const index = match[1];
                this.error = res[index].length == 0;
                for(const option of res[index]) {
                    this.addOption(option.id, option.name);
                }
                const last: string | null = localStorage.getItem(this.id + '-select');
                if(last != null)
                    this.precompile(this.parseValue(last));
                else if(!this.error)
                    this.precompile(res[index][0].id);
                formOrSection.validate();
                const label = document.createElement('label');
                label.htmlFor = this.id;
                label.innerText = this.labelText;
                container.appendChild(label);
                if(this.error) {
                    const create = new RedirectButton('Create ' + this.labelText.replace(':', '').replace('Default ', ''), '/img/create.svg', this.url.replace('/api', '') + '/create');
                    create.appendTo(container);
                }
                else {
                    this.select.addEventListener('change', async (): Promise<void> => {
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

    parseValue(value: string): number {
        return parseInt(value);
    }

    getError(): boolean {
        return this.error;
    }
}

export abstract class InputSection extends InputElement<JsonObject> {
    private readonly title: string;
    private readonly elements: FormAppendable[];
    protected readonly section: HTMLDivElement;
    private form: Form | undefined = undefined;
    private error: boolean = true;

    constructor(title: string, elements: FormAppendable[]) {
        super('');
        this.title = title;
        this.elements = elements;
        this.section = document.createElement('div');
        this.section.classList.add('box', 'section');
        const h3 = document.createElement('h3');
        h3.innerText = this.title;
        this.section.appendChild(h3);
        for(const input of elements)
            input.appendTo(this);
        this.validate();
    }

    appendChild(node: HTMLElement): void {
        this.section.appendChild(node);
    }

    appendTo(form: Form): void {
        this.form = form;
        form.appendChild(this.section);
    }

    getError(): boolean {
        return this.error;
    }

    validate(): void {
        this.error = false;
        for(const input of this.elements) {
            if(input instanceof InputElement)
                this.error = this.error || input.getError();
        }
        this.form?.validate();
    }
}