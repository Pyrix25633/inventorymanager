import { UnitOfMeasurement } from "@prisma/client";
import { Customization } from "../database/user";
import { BadRequest } from "../web/response";
import { getArray, getBoolean, getInt, getNonEmptyString, getObject, getString } from "./type-validation";

type OrderValue = { [index: string]: 'asc' | 'desc' | OrderValue; };
export type Order = OrderValue[];

const usernameRegex = /^(?:\w|-| ){3,32}$/;
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const bulkSeparator = '~';

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

export function getTitle(raw: any): string {
    const parsed = getString(raw);
    if(parsed.length < 1 || parsed.length > 32)
        throw new BadRequest();
    return parsed;
}

export function getBulkTitle(raw: any): { bulk: false; title: string; } | { bulk: true; titles: string[]; } {
    const parsed = getString(raw);
    if(parsed.includes(bulkSeparator)) {
        const titles = parsed.split(bulkSeparator);
        for(const title of titles) {
            getTitle(title);
        }
        return { bulk: true, titles: titles };
    }
    if(parsed.length < 1 || parsed.length > 32)
        throw new BadRequest();
    return { bulk: false, title: parsed };
}

export function getQuantity(raw: any): number {
    const parsed = getInt(raw);
    if(parsed <= 0)
        throw new BadRequest();
    return parsed;
}

export function getUnitOfMeasurement(raw: any): UnitOfMeasurement {
    const parsed = getNonEmptyString(raw);
    for(const unitOfMeasurement of Object.values(UnitOfMeasurement)) {
        if(unitOfMeasurement == parsed)
            return unitOfMeasurement;
    }
    throw new BadRequest();
}

export function getDate(raw: any): Date {
    const parsed = getString(raw);
    if(!parsed.match(/\d{4}\/\d{1,2}\/\d{1,2}/))
        throw new BadRequest();
    const date = new Date(parsed + ' UTC');
    if(date.toString() == 'Invalid Date' || isNaN(date.getTime()))
        throw new BadRequest();
    return date;
}

export function getOrderValue(raw: any): OrderValue {
    const parsed: any = getObject(raw);
    const keys = Object.keys(parsed);
    if(keys.length != 1)
        throw new BadRequest();
    const value = parsed[keys[0]];
    if(typeof value == 'object')
        getOrderValue(value);
    else if(value != 'asc' && value != 'desc')
        throw new BadRequest();
    return parsed;
}

export function getOrder(raw: any): Order {
    const parsed = getArray(raw);
    for(const value of parsed)
        getOrderValue(value);
    return parsed;
}