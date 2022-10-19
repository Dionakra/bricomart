import fetch from "node-fetch";
import Retailer from "./types/model/Retailer";
import RetailerResponse from "./types/rest/RetailerResponse"
import CategoryResponse from "./types/rest/CategoryResponse"
import Category from "./types/model/Category";
import Product from "./types/model/Product";
import CategoryListResponse from "./types/rest/CategoryListResponse";

export default class BricomartService {

    constructor() {

    }

    async getRetailers(): Promise<Retailer[]> {
        const retailers: RetailerResponse[] = await this.performRequest("/retailers")
            .then(json => <RetailerResponse[]>json)

        return retailers
            .filter(retailer => retailer.seller_code != "000")
            .map(retailer => {
                return <Retailer>{
                    id: retailer.id,
                    name: retailer.name.replace("Bricomart", "").trim()
                }
            })
    }

    async getCategories(retailer: Retailer): Promise<Category[]> {
        const categories: CategoryResponse[] = await this.performRequest(`/categories/tree/2/depth/1/retailer/${retailer.id}`)
            .then(json => <CategoryResponse[]>json)

        // The API returns the base object in a one-length array
        return categories[0].children_data
            .map(BricomartService.mapCategory)
    }

    async getSubCategories(retailer: Retailer, category: Category): Promise<Category[]> {
        const categories: CategoryResponse[] = await this.performRequest(`/categories/tree/${category.url}/depth/2/retailer/${retailer.id}`)
            .then(json => <CategoryResponse[]>json)

        // The API returns the base object in a one-length array
        return categories[0].children_data
            .flatMap(category => category.children_data)
            .filter(cat => cat.product_count > 0)
            .map(BricomartService.mapCategory)
    }

    async getProducts(retailer: Retailer, category: Category, page: number, pageSize: number): Promise<[Product[], number]> {
        const filter = {
            "page_size": pageSize,
            "filters": {},
            "order_by": {
                "field": "order",
                "dir": "ASC"
            },
            "retailer_id": retailer.id,
            "category_id": encodeURIComponent(category.url),
            "page_id": page
        }

        const productsResponse: CategoryListResponse[] = await this.performRequest(`/products/list/${encodeURIComponent(JSON.stringify(filter))}`)
            .then(json => <CategoryListResponse[]>json)

        const products = productsResponse[0].list.map(product => {
            return <Product>{
                sku: product.sku,
                name: product.name,
                img: product.mainpicturecode,
                url: product.url_key,
                price: this.stringToNumber(product.retailer_offer.price_ht),
                price_vat: this.stringToNumber(product.retailer_offer.price),
            }
        })

        return [products, productsResponse[0].size]
    }

    private stringToNumber(number: string): string {
        return parseFloat(number).toFixed(2)
    }

    private static mapCategory(category: CategoryResponse): Category {
        return <Category>{
            id: category.id,
            name: category.name,
            url: category.url_path,
            subcategories: category.children_data
                .filter(child => child.name != null)
                .map(BricomartService.mapCategory)
        }
    }

    private performRequest(endpoint: string): Promise<any> {
        return fetch(`https://www.bricomart.es/rest/V1${endpoint}`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "es,en-GB;q=0.9,en;q=0.8",
                "authorization": "Bearer lhzi2b9ks5fryccceiby6b1u34v4fe6i",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
                "cookie": this.getCookie()
            },
            "method": "GET"
        })
            .then((x: { json: () => any; }) => x.json())
    }

    private getCookie(): string {
        return "OptanonAlertBoxClosed=2022-03-06T16:06:03.831Z; " +
            " _ga=GA1.2.2107889986.1646582764;  " +
            " t2s-analytics=ae2b56a7-0c59-4d32-de7a-91cd3f6a9ec3;  " +
            " t2s-p=ae2b56a7-0c59-4d32-de7a-91cd3f6a9ec3;  " +
            " _fbp=fb.1.1648836496277.845043463;  " +
            " _gcl_au=1.1.295745258.1664138423;  " +
            " vuex=%7B%22cookies%22%3A%7B%22user%22%3A%7B%22token%22%3A%22%22%2C%22rememberMe%22%3Afalse%2C%22sessionStarted%22%3Anull%2C%22isUserPro%22%3Afalse%2C%22allowedSaveCookie%22%3A%22%2CC0001%2CC0002%2CC0003%2CC0004%2CC0005%2C%22%2C%22id%22%3A%22%22%7D%2C%22selectedStore%22%3A%7B%22id%22%3A%2255%22%2C%22seller_code%22%3A%22014%22%2C%22name%22%3A%22Bricomart%20Bormujos%22%7D%2C%22isEcommerceActivated%22%3Atrue%7D%7D; PHPSESSID=38asturlk68q93g41jqhmbco2g; " +
            " _gid=GA1.2.1298255878.1665587997; " +
            " __atssc=google%3B13; " +
            " __atuvc=3%7C37%2C0%7C38%2C10%7C39%2C12%7C40%2C26%7C41; " +
            " __atuvs=6346db1baf9e98b2010; " +
            // Possible important date
            " OptanonConsent=isGpcEnabled=0&datestamp=Wed+Oct+12+2022+17%3A50%3A51+GMT%2B0200+(hora+de+verano+de+Europa+central)&version=6.26.0&isIABGlobal=false&hosts=&consentId=6ee1bb9b-55a6-4ac4-a57a-1acef801d7dd&interactionCount=8&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1%2CC0005%3A1&AwaitingReconsent=false&geolocation=ES%3BAN; " +
            " datadome=.FSEF8991fy10tK-0JV~YLj8mrvWbPZJTEVEJ1BRZHOK8r5kH~mKX8Xs0Q4Vt_BatdAjv15bWSJ6rBc-rtnhM9_rypb1IC1~vlN0Kcx.pw2ItuAEaX4xHiiTFafOtpX1";
    }
}