<template>
  <div class="w-full my-2">
    <header>
      <img src="/bricomart.svg" alt="Bricomart logo" class="h-24 mx-auto" />
    </header>

    <main class="mx-4">
      <div class="w-full flex flex-wrap mt-4" v-if="data != undefined">
        <div v-for="product in data" :key="product.sku" class="w-full sm:w-1/2 lg:w-1/4">
          <div class="m-2 flex justify-center">
            <a :href="product.url" target="_blank" class="border border-gray-300 rounded-md shadow-lg hover:shadow-xl hover:cursor-pointer">
              <img :src="product.img" :alt="product.name" class="w-full rounded-t-md" />

              <div class="px-2 my-2">
                <div>
                  <p class="text-sm font-semibold">{{ product.category }}</p>
                  <p>{{ product.name }}</p>
                </div>

                <div class="mt-2">
                  <p class="text-lg">Precios</p>

                  <p class="text-md px-1 font-semibold">Alcalá</p>
                  <div class="px-2 text-sm  mb-2">
                    <p v-for="price in product.prices.alcala.reverse()" :key="price">
                      {{ price.date }} -
                      <span class="font-bold">{{ price.price }} €</span>
                    </p>
                  </div>

                  <p class="text-md px-1 font-semibold">Bormujos</p>
                  <div class="px-2 text-sm">
                    <p v-for="price in product.prices.bormujos.reverse()" :key="price">
                      {{ price.date }} -
                      <span class="font-bold">{{ price.price }} €</span>
                    </p>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: []
    }
  },
  created() {
    fetch('/data.json')
      .then((response) => response.json())
      .then((json) => (this.data = json))
  }
}
</script>