import { Customization } from "../database/user";
import { BadRequest } from "../web/response";
import { getBoolean, getInt, getObject, getString } from "./type-validation";

export type Order = { [index: string]: 'asc' | 'desc'; };

const usernameRegex = /^(?:\w|-| ){3,32}$/;
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function getUsername(raw: any): string {
    const parsed = getString(raw);
    if(parsed.match(usernameRegex))
        return parsed;
    throw new BadRequest();
}

export function getEmail(raw: any): string {
    const parsed = getString(raw);
    if(parsed.match(emailRegex))
        return parsed;
    throw new BadRequest();
}

export function getSixDigitCode(raw: any): number {
    const parsed = getInt(raw);
    if(parsed < 100000 || parsed > 999999)
        throw new BadRequest();
    return parsed;
}

export function getToken(raw: any): string {
    const parsed = getString(raw);
    if(parsed.length != 128)
        throw new BadRequest();
    return parsed;
}

export function getCustomization(raw: any): Customization {
    if(typeof raw != 'object')
        throw new BadRequest();
    return {
        compactMode: getBoolean(raw.compactMode),
        condensedFont: getBoolean(raw.condensedFont),
        aurebeshFont: getBoolean(raw.aurebeshFont),
        sharpMode: getBoolean(raw.sharpMode)
    };
}

export function getSessionDuration(raw: any): number {
    const parsed = getInt(raw);
    if(parsed < 5 || parsed > 90)
        throw new BadRequest();
    return parsed;
}

export function getTfaKey(raw: any): string {
    const parsed = getString(raw);
    if(!parsed.match(/^\w{52}$/))
        throw new BadRequest();
    return parsed;
}

export function getName(raw: any): string {
    const parsed = getString(raw);
    if(parsed.length < 3 || parsed.length > 32)
        throw new BadRequest();
    return parsed;
}

export function getOrder(raw: any): Order {
    const parsed: any = getObject(raw);
    for(const index of Object.keys(parsed)) {
        const order = parsed[index];
        if(order != 'asc' && order != 'desc')
            throw new BadRequest();
    }
    return parsed;
}