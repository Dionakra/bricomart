export default interface CategoryResponse {
    id: number
    category_block_identifier: string // Nivel 2 de búsqueda
    name: string
    url_path: string // Para el listado
    children_data: CategoryResponse[]
    product_count: number;
}