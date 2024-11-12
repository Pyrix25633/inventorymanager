import { Request, Response } from "express";
import { createLocation, findLocation, findLocations } from "../database/location";
import { getName } from "../validation/semantic-validation";
import { getInt, getObject } from "../validation/type-validation";
import { Created, Forbidden, handleException, Ok } from "../web/response";
import { validateToken } from "./auth";

export async function getLocations(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        //ordering
        //modify query in table class to use asc/desc and no page
        console.log(req.query);
        const locations = await findLocations(user.id);
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
        if(location.userId != user.id) throw new Forbidden();
        new Ok({ name: location.name });
    } catch(e: any) {
        handleException(e, res);
    }
}