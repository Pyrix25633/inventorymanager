import { Request, Response } from "express";
import { createLocation } from "../database/location";
import { getName } from "../validation/semantic-validation";
import { getObject } from "../validation/type-validation";
import { Created, handleException } from "../web/response";
import { validateToken } from "./auth";

export async function postLocation(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const body = getObject(req.body);
        const name = getName(body.name);
        const tempUser = await createLocation(user.id, name);
        new Created({username: tempUser.id}).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}