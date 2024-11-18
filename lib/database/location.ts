import { Location } from "@prisma/client";
import { Order } from "../validation/semantic-validation";
import { NotFound, UnprocessableContent } from "../web/response";
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

export async function findLocations(userId: number, orderBy: Order | undefined = undefined): Promise<{ id: number; name: string; }[]> {
    return prisma.location.findMany({
        select: {
            id: true,
            name: true
        },
        where: {
            userId: userId
        },
        orderBy: orderBy
    });
}

export async function findLocation(id: number): Promise<Location> {
    const location: Location | null = await prisma.location.findUnique({
        where: {
            id: id
        }
    });
    if(location == null)
        throw new NotFound();
    return location;
}

export async function updateLocation(id: number, name: string): Promise<Location> {
    try {
        return await prisma.location.update({
            data: {
                name: name
            },
            where: {
                id: id
            }
        });
    } catch(e: any) {
        throw new UnprocessableContent();
    }
}