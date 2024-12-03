import { Product, UnitOfMeasurement } from "@prisma/client";
import { settings } from "../settings";
import { Order } from "../validation/semantic-validation";
import { NotFound, UnprocessableContent } from "../web/response";
import { prisma } from "./prisma";

export async function isProductNameInUse(userId: number, name: string): Promise<boolean> {
    return (await prisma.product.count({
        where: {
            userId: userId,
            name: name
        }
    })) != 0;
}

export async function createProduct(userId: number, name: string, defaultQuantity: number, defaultUnitOfMeasurement: UnitOfMeasurement, defaultLocationId: number): Promise<Product> {
    try {
        return await prisma.product.create({
            data: {
                userId: userId,
                name: name,
                defaultQuantity: defaultQuantity,
                defaultUnitOfMeasurement: defaultUnitOfMeasurement,
                defaultLocationId: defaultLocationId
            }
        });
    } catch(e: any) {
        throw new UnprocessableContent();
    }
}

export async function findProducts(userId: number, page: number | undefined, order: Order | undefined): Promise<{ name: string; defaultQuantity: number; defaultUnitOfMeasurement: UnitOfMeasurement, defaultLocation: { name: string; }; }[]> {
    return prisma.product.findMany({
        select: {
            id: true,
            name: true,
            defaultQuantity: true,
            defaultUnitOfMeasurement: true,
            defaultLocation: {
                select: {
                    name: true
                }
            }
        },
        where: {
            userId: userId
        },
        orderBy: order,
        skip: page != undefined ? page * settings.database.pageSize : undefined,
        take: page != undefined ? settings.database.pageSize : undefined
    });
}

export async function countProductPages(): Promise<number> {
    return Math.ceil(await prisma.category.count() / settings.database.pageSize);
}

export async function findProduct(id: number): Promise<Product> {
    const product: Product | null = await prisma.product.findUnique({
        where: {
            id: id
        }
    });
    if(product == null)
        throw new NotFound();
    return product;
}

export async function updateProduct(id: number, name: string, defaultQuantity: number, defaultUnitOfMeasurement: UnitOfMeasurement, defaultLocationId: number): Promise<Product> {
    try {
        return await prisma.product.update({
            data: {
                name: name,
                defaultQuantity: defaultQuantity,
                defaultUnitOfMeasurement: defaultUnitOfMeasurement,
                defaultLocationId: defaultLocationId
            },
            where: {
                id: id
            }
        });
    } catch(e: any) {
        throw new UnprocessableContent();
    }
}