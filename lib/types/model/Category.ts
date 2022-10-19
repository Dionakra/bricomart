export default interface Category {
    id: number;
    name: string
    url: string
    subcategories: Category[];
}