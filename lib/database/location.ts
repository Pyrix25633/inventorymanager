import { Location } from "@prisma/client";
import { UnprocessableContent } from "../web/response";
import { prisma } from "./prisma";

export async function isLocationNameInUse(userId: number, name: string): Promise<boolean> {
    return (await prisma.location.count({
        where: {
            userId: userId,
            name: name
        }
    })) != 0;
}

export async function createLocation(userId: number, name: string): Promise<Location> {
    try {
        return await prisma.location.create({
            data: {
                userId: userId,
                name: name
            }
        });
    } catch(e: any) {
        throw new UnprocessableContent();
    }
}