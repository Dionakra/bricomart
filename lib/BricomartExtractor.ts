import BricomartService from "./BricomartService.js";
import Category from "./types/model/Category.js";
import Product from "./types/model/Product.js";
import Retailer from "./types/model/Retailer.js";
import * as fs from "fs"
import ProductDO from "./types/model/ProductDO.js";


extraction()

async function extraction() {
    const service = new BricomartService();
    const date = new Date().toISOString().substring(0, 10)
    const pageSize: number = 20;
    const retailers: Retailer[] = await service.getRetailers()

    for (const retailer of retailers) {
        console.info(`Processing data for retailer ${retailer.name}...`)

        const categories: Category[] = await service.getCategories(retailer)

        const dbPath = new URL(`../public/${retailer.id}.json `, import.meta.url)
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, JSON.stringify([]))
        }
        const dbProducts: ProductDO[] = JSON.parse(fs.readFileSync(dbPath, "utf-8"))

        for (const category of categories) {
            console.info(`  ${category.name}`)
            const subcategories: Category[] = await service.getSubCategories(retailer, category)
            const categoryProducts: ProductDO[] = []

            for (const subcategory of subcategories) {
                let totalElements: number = 0;
                let size = 0
                let page: number = 1;
                do {
                    console.info(`  ${category.name}  ${subcategory.name}, page ${page}`)
                    const data = await service.getProducts(retailer, subcategory, page++, pageSize)
                    const products = data[0]
                    size = data[1]

                    products.forEach(product => {
                        let dbProduct: ProductDO = dbProducts.find(pr => pr.sku == product.sku)

                        if (dbProduct == undefined) {
                            dbProduct = <ProductDO>{
                                sku: product.sku,
                                name: product.name,
                                img: product.img,
                                url: product.url,
                                prices: [
                                    {
                                        date: date,
                                        retailer: retailer.id,
                                        price: product.price,
                                        price_vat: product.price_vat
                                    }
                                ]
                            }
                        } else {
                            const lastPrice = dbProduct.prices[dbProduct.prices.length - 1]

                            if (lastPrice.price != product.price) {
                                dbProduct.prices.push(
                                    {
                                        date: date,
                                        retailer: retailer.id,
                                        price: product.price,
                                        price_vat: product.price_vat
                                    }
                                )
                            }

                        }

                        categoryProducts.push(dbProduct)
                    })

                    totalElements += pageSize
                    if (totalElements >= size) {
                        break;
                    }

                    await sleep(1500);
                } while (totalElements < size)

            }

            fs.writeFileSync(dbPath, JSON.stringify(categoryProducts))
        }
        process.exit(-1)
    }
}

async function sleep(ms: number): Promise<any> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

