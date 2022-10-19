export default interface CategoryListResponse {
    size: number;
    list: {
        sku: string;
        name: string;
        mainpicturecode: string //  "3/c/7/1/rasillon_machihembrado_x_x_cm_10993360_picture.jpeg"  | https://www.bricomart.es/pub/media/catalog/product/3/c/7/1/rasillon_machihembrado_x_x_cm_10993360_picture.jpeg
        url_key: string // "lad-rasillon-machihembrado-80x25x4cm-10993360" | https://www.bricomart.es/lad-rasillon-machihembrado-80x25x4cm-10993360.html
        retailer_offer: {
            price_ht: string  // "1.1818" Previo sin iva
            price: string // "1.4300" Precio con IVA
        },
    }[]
}