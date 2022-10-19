export default interface ProductDO {
    sku: string;
    name: string;
    img: string;
    url: string;
    prices: {
        retailer: string;
        date: string;
        price: string;
        price_vat: string;
    }[]

}