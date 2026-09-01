export interface Ammunation {
    bestPrice: number,
    id: string,
    name: string,
    priceHistory: priceHistory[],
    updateAt: Date
}

interface priceHistory {
    price: number,
    Timestamp: any
}