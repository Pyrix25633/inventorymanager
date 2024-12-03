import { Stock, UnitOfMeasurement } from "@prisma/client";
import { settings } from "../settings";
import { Order } from "../validation/semantic-validation";
import { NotFound, UnprocessableContent } from "../web/response";
import { prisma } from "./prisma";

export async function createStock(userId: number, expiration: Date, productId: number, quantity: number, unitOfMeasurement: UnitOfMeasurement, locationId: number): Promise<Stock> {
    try {
        return await prisma.stock.create({
            data: {
                userId: userId,
                expiration: expiration,
                productId: productId,
                quantity: quantity,
                unitOfMeasurement: unitOfMeasurement,
                locationId: locationId
            }
        });
    } catch(e: any) {
        throw new UnprocessableContent();
    }
}

export async function findStocks(userId: number, page: number | undefined, order: Order | undefined): Promise<{ expiration: Date; product: { name: string; }; quantity: number; unitOfMeasurement: UnitOfMeasurement; location: { name: string; }; }[]> {
    return prisma.stock.findMany({
        select: {
            id: true,
            expiration: true,
            product: {
                select: {
                    name: true
                }
            },
            quantity: true,
            unitOfMeasurement: true,
            location: {
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

export async function countStocksPages(): Promise<number> {
    return Math.ceil(await prisma.stock.count() / settings.database.pageSize);
}

export async function findStock(id: number): Promise<Stock> {
    const stock: Stock | null = await prisma.stock.findUnique({
        where: {
            id: id
        }
    });
    if(stock == null)
        throw new NotFound();
    return stock;
}

export async function updateStock(id: number, expiration: Date, productId: number, quantity: number, unitOfMeasurement: UnitOfMeasurement, locationId: number): Promise<Stock> {
    try {
        return await prisma.stock.update({
            data: {
                expiration: expiration,
                productId: productId,
                quantity: quantity,
                unitOfMeasurement: unitOfMeasurement,
                locationId: locationId
            },
            where: {
                id: id
            }
        });
    } catch(e: any) {
        throw new UnprocessableContent();
    }
}

export async function deleteBook(id: number): Promise<Stock> {
    return prisma.stock.delete({
        where: {
            id: id
        }
    });
}