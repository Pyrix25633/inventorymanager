function navigateToErrorPage(req) {
    window.location.href = '/error?code=' + req.status + '&message=' + req.statusText;
}
export const pendingActionKey = 'pendingAction';
export const defaultStatusCode = {
    400: (req) => {
        navigateToErrorPage(req);
    },
    401: () => {
        localStorage.setItem(pendingActionKey, window.location.pathname);
        window.location.href = '/login';
    },
    403: (req) => {
        navigateToErrorPage(req);
    },
    404: (req) => {
        navigateToErrorPage(req);
    },
    405: (req) => {
        navigateToErrorPage(req);
    },
    422: (req) => {
        navigateToErrorPage(req);
    },
    500: (req) => {
        navigateToErrorPage(req);
    }
};
export const imageButtonAnimationKeyframes = [
    { transform: 'scale(0.6)' },
    { transform: 'scale(1.4)' },
    { transform: 'scale(1)' }
];
export const imageButtonAnimationOptions = {
    duration: 250
};
export class RequireNonNull {
    static getElementById(id) {
        const element = document.getElementById(id);
        if (element != null)
            return element;
        throw new Error('No element found with id: ' + id);
    }
    static parse(value) {
        if (value == null)
            throw new Error('Null not allowed');
        return value;
    }
}
export class Auth {
    static getCookie() {
        const match = document.cookie.match(new RegExp(Auth.cookieName + "=(.+?)(?:;|$)"));
        if (match == null)
            throw new Error('Auth Cookie not found!');
        return match[1];
    }
    static async validateToken() {
        return new Promise((resolve) => {
            $.ajax({
                url: '/api/auth/validate-token',
                method: 'GET',
                success: (res) => {
                    if (res.valid)
                        resolve();
                    else {
                        localStorage.setItem(pendingActionKey, window.location.pathname);
                        window.location.href = '/login';
                    }
                },
                statusCode: defaultStatusCode
            });
        });
    }
}
Auth.cookieName = 'inventorymanager-auth';
const cachedCustomizationKey = 'cachedCustomization';
export class Customization {
    constructor(json) {
        var _a, _b, _c, _d;
        this.compactMode = (_a = json === null || json === void 0 ? void 0 : json.compactMode) !== null && _a !== void 0 ? _a : false;
        this.condensedFont = (_b = json === null || json === void 0 ? void 0 : json.condensedFont) !== null && _b !== void 0 ? _b : false;
        this.aurebeshFont = (_c = json === null || json === void 0 ? void 0 : json.aurebeshFont) !== null && _c !== void 0 ? _c : false;
        this.sharpMode = (_d = json === null || json === void 0 ? void 0 : json.sharpMode) !== null && _d !== void 0 ? _d : false;
    }
    static loadCached() {
        var _a;
        return new Customization(JSON.parse((_a = localStorage.getItem(cachedCustomizationKey)) !== null && _a !== void 0 ? _a : 'null'));
    }
    static async get() {
        return new Promise((resolve) => {
            $.ajax({
                url: '/api/settings/customization',
                method: 'GET',
                success: (res) => {
                    resolve(new Customization(res));
                },
                statusCode: defaultStatusCode
            });
        });
    }
    cache() {
        localStorage.setItem(cachedCustomizationKey, JSON.stringify(this));
    }
}
export class CssManager {
    constructor() {
        this.compactModeCssLink = RequireNonNull.getElementById('compact-mode-css');
        this.sharpModeCssLink = RequireNonNull.getElementById('sharp-mode-css');
        this.fontCssLink = RequireNonNull.getElementById('font-css');
    }
    applyStyle(customization) {
        this.compactModeCssLink.href = CssManager.buildLink('compact-mode', customization.compactMode);
        this.sharpModeCssLink.href = CssManager.buildLink('sharp-mode', customization.sharpMode);
        this.fontCssLink.href = CssManager.buildLink((customization.aurebeshFont ? 'aurebesh' : 'roboto') + '-condensed', customization.condensedFont);
    }
    static buildLink(name, on) {
        return '/css/' + name + '-' + (on ? 'on' : 'off') + '.css';
    }
}
export function getParameter(regExp) {
    const match = window.location.href.match(regExp);
    if (match == null) {
        window.location.href = '/error?code=400&message=Bad%20Request';
        throw new Error('Invalid Parameter!');
    }
    return match[1];
}
