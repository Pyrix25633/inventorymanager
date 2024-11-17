import { Request, Response } from "express";
import { createLocation, findLocation, findLocations, updateLocation } from "../database/location";
import { getName, getOrder } from "../validation/semantic-validation";
import { getInt, getObject, getOrUndefined } from "../validation/type-validation";
import { Created, Forbidden, handleException, NoContent, Ok } from "../web/response";
import { validateToken } from "./auth";

export async function getLocations(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const order = getOrUndefined(req.query.order, getOrder);
        const locations = await findLocations(user.id, order);
        new Ok({ locations: locations }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function postLocation(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const body = getObject(req.body);
        const name = getName(body.name);
        const location = await createLocation(user.id, name);
        new Created({ id: location.id }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function getLocation(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const id = getInt(req.params.locationId);
        const location = await findLocation(id);
        if(location.userId != user.id)
            throw new Forbidden();
        new Ok({ name: location.name }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function patchLocation(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const id = getInt(req.params.locationId);
        const body = getObject(req.body);
        const name = getName(body.name);
        const location = await findLocation(id);
        if(location.userId != user.id)
            throw new Forbidden();
        await updateLocation(id, name);
        new NoContent().send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}