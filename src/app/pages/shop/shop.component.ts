import { Component, OnInit } from "@angular/core";
import { CartService } from "../../services/cart.service";
import { DetailProductComponent } from "./detail-product/detail-product.component";
import { MatDialog } from "@angular/material/dialog";
import { ProductService } from "src/app/services/product.service";
import { Observable } from "rxjs";
import Swal from "sweetalert2";
import { ActivatedRoute } from "@angular/router";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand: string;
  gender: string;
  type: string;
  subcategory: string;
  sizes: {
    valor: string;
    colors: {
      color: string;
      cant: number;
    }[];
  }[];
  style: string;
  stock: number;
}

@Component({
  selector: "app-shop",
  templateUrl: "./shop.component.html",
  styleUrls: ["./shop.component.css"],
})
export class ShopComponent implements OnInit {
  // Variable para controlar la visibilidad del panel de filtros
  areFiltersVisible: boolean = true;

  // Método para alternar la visibilidad del panel de filtros
  toggleFilters(): void {
    this.areFiltersVisible = !this.areFiltersVisible;
    // Opcional: guardar la preferencia en localStorage
    localStorage.setItem('filtersVisible', this.areFiltersVisible.toString());
  }
  filteredProducts: Product[] = [];
  productsService: Product[] = [];
  isLoading = true;

  searchTerm: string = "";
  sortOption: string = "az";

  // Variables específicas del modal
  isModalOpen = false;
  modalSelectedSize: string = "";
  modalSelectedColor: string = "";
  modalAvailableSizes: {
    valor: string;
    colors: { color: string; cant: number }[];
  }[] = [];
  modalProduct: Product;

  // Variables para filtros dinámicos
  categories: string[] = [];
  genders: string[] = [];
  colors: string[] = [];
  sizes: string[] = []; // Tallas dinámicas

  // Variables seleccionadas para filtros
  selectedCategory: string = "";
  selectedGender: string = "";
  selectedColor: string = "";
  selectedSize: string = "";
  selectedMinPrice: number = 0;
  selectedMaxPrice: number = 0;

  // Rango de precios
  minPrice: number = 0;
  maxPrice: number = 0;

  showSortMobile: boolean = false;

  colorMap: { [key: string]: string } = {
    rojo: "#ff4d4d",
    azul: "#4d79ff",
    verde: "#4dff88",
    negro: "#222",
    blanco: "#fff",
    amarillo: "#ffe066",
    gris: "#bdbdbd",
    naranja: "#ffb84d",
    rosa: "#ff4da6",
    morado: "#a64dff",
    marrón: "#a0522d",
    multicolor: "multicolor",
    // Agrega más según tus necesidades
  };

  constructor(
    private dialog: MatDialog,
    private cartService: CartService,
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  

  ngOnInit() {
    this.loadProducts();
    this.resetFilters();
    // Opcional: recuperar la preferencia de localStorage
    const savedVisibility = localStorage.getItem('filtersVisible');
    if (savedVisibility !== null) {
      this.areFiltersVisible = savedVisibility === 'true';
    }

      // Leer los parámetros de la URL
      this.route.queryParams.subscribe(params => {
        if (params['gender']) {
          this.selectedGender = params['gender'];
          this.applyFilters();
        }
      });
  }

  setSort(option: string) {
    this.sortOption = option;
    this.applySort();
  }

  openModal(product: Product) {
    this.modalProduct = product;
    this.modalAvailableSizes = product.sizes;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalSelectedSize = "";
    this.modalSelectedColor = "";
  }

  loadProducts() {
    this.productService.getProducts().subscribe(
      (response) => {
        if (response.status === "ok" && "data" in response) {
          this.productsService = response.data;
          this.filteredProducts = [...this.productsService];

          // Generar filtros dinámicos
          this.generateDynamicFilters();
        }
        this.isLoading = false;
      },
      (error) => {
        console.error("Error al cargar productos:", error);
        this.isLoading = false;
      }
    );
  }
  generateDynamicFilters() {
    if (!this.productsService || this.productsService.length === 0) {
      console.warn("No hay productos disponibles para generar filtros");
      return;
    }
    this.categories = [...new Set(this.productsService.map((p) => p.category))];
    this.genders = [...new Set(this.productsService.map((p) => p.gender))];
    this.colors = [
      ...new Set(
        this.productsService.reduce(
          (acc, p) =>
            acc.concat(
              p.sizes.reduce(
                (sizes, size) =>
                  sizes.concat(size.colors.map((color) => color.color)),
                []
              )
            ),
          []
        )
      ),
    ] as string[];
    this.sizes = [
      ...new Set(
        this.productsService.reduce(
          (acc, p) => acc.concat(p.sizes.map((size) => size.valor)),
          []
        )
      ),
    ] as string[];

    const prices = this.productsService.map((p) => p.price);
    this.minPrice = Math.min(...prices);
    this.maxPrice = Math.max(...prices);
    // Inicializar los precios seleccionados
    this.selectedMinPrice = this.minPrice;
    this.selectedMaxPrice = this.maxPrice;
  }
  applyFilters() {
    this.filteredProducts = this.productsService.filter((product) => {
      const matchesCategory =
        !this.selectedCategory || product.category === this.selectedCategory;
      const matchesGender =
        !this.selectedGender || product.gender === this.selectedGender;
      const matchesColor =
        !this.selectedColor ||
        product.sizes.some((size) =>
          size.colors.some((color) => color.color === this.selectedColor)
        );
      const matchesSize =
        !this.selectedSize ||
        product.sizes.some((size) => size.valor === this.selectedSize);
      // Modificar la condición de precio
      const matchesPrice = 
        product.price >= this.selectedMinPrice && 
        product.price <= this.selectedMaxPrice;

      return (
        matchesCategory &&
        matchesGender &&
        matchesColor &&
        matchesSize &&
        matchesPrice
      );
    });
    this.sortProducts();
  }

  applySort() {
    this.isLoading = true; // Mostrar el loader cuando se ordenan los productos
    setTimeout(() => {
      this.sortProducts(); // Solo ordenar, sin filtrar
      this.isLoading = false; // Ocultar el loader después de ordenar
    }, 300); // Puedes ajustar el retraso si deseas un efecto de "cargando"
  }

  resetFilters() {
    this.searchTerm = "";
    this.selectedMinPrice = this.minPrice;
    this.selectedMaxPrice = this.maxPrice;
    this.sortOption = "az";
    this.applyFilters();
  }

  sortProducts() {
    switch (this.sortOption) {
      case "az":
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "low-high":
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "high-low":
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
    }
  }

  openProductModal(product: Product) {
    const dialogRef = this.dialog.open(DetailProductComponent, {
      width: "800px",
      data: { product },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("Producto agregado al carrito:", result);
      }
    });
  }

  selectSize(size: { valor: string; colors: { color: string; cant: number }[] }) {
    this.modalSelectedSize = size.valor;
    // Si la talla tiene colores disponibles, selecciona el primero con stock
    const colorConStock = size.colors.find(c => c.cant > 0);
    this.modalSelectedColor = colorConStock ? colorConStock.color : "";
  }
  hasStockForSize(size: { colors: { color: string; cant: number }[] }): boolean {
    return size.colors.some(c => c.cant > 0);
  }

  getColorsForSelectedSize() {
    const size = this.modalAvailableSizes.find(s => s.valor === this.modalSelectedSize);
    return size ? size.colors : [];
  }
  getColorStyle(color: string) {
    if (color === 'multicolor') {
      // Puedes personalizar el degradado como quieras
      return {
        background: 'linear-gradient(135deg, #ff4d4d 0%, #ffe066 33%, #4dff88 66%, #4d79ff 100%)',
        color: '#222'
      };
    }
    return {
      background: this.colorMap[color] || '#eee',
      color: color === 'blanco' ? '#222' : '#fff'
    };
  }

  clearFilters() {
    this.searchTerm = "";
    this.minPrice = null;
    this.maxPrice = null;
    this.sortOption = "az";
    this.resetFilters();
  }

  confirmSelection() {
    if (!this.modalSelectedSize || !this.modalSelectedColor) {
      Swal.fire({
        icon: "warning",
        title: "Faltan opciones",
        text: "Por favor selecciona una talla y un color antes de agregar al carrito.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const selectedSizeObj = this.modalProduct.sizes.find(
      (s) => s.valor === this.modalSelectedSize
    );
    const selectedColorObj = selectedSizeObj?.colors.find(
      (c) => c.color === this.modalSelectedColor
    );

    if (!selectedColorObj || selectedColorObj.cant <= 0) {
      Swal.fire({
        icon: "error",
        title: "Stock no disponible",
        text: "Lo sentimos, no hay stock disponible para la combinación seleccionada.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    this.cartService.addToCart(
      this.modalProduct,
      1,
      this.modalSelectedSize,
      this.modalSelectedColor
    );

    Swal.fire({
      icon: "success",
      title: "¡Producto agregado al carrito!",
      text: `El producto se ha añadido con la talla ${this.modalSelectedSize} y color ${this.modalSelectedColor}`,
      confirmButtonColor: "#3085d6",
      timer: 2000,
      showConfirmButton: false,
    });

    this.closeModal();
  }
  getAvailableStock(size: string, color: string): number {
    const sizeObj = this.modalProduct?.sizes.find((s) => s.valor === size);
    const colorObj = sizeObj?.colors.find((c) => c.color === color);
    return colorObj?.cant || 0;
  }
  selectColor(color: string) {
    this.modalSelectedColor = color;
  }

  addToCart(product: Product, selectedSize: string) {
    console.log("Producto agregado al carrito", { ...product, selectedSize });
    this.cartService.addToCart(
      product,
      1,
      selectedSize,
      this.modalSelectedColor
    );
  }
  
  onMinPriceChange() {
    if (this.selectedMinPrice > this.selectedMaxPrice) {
      this.selectedMinPrice = this.selectedMaxPrice;
    }
    this.applyFilters();
  }

  onMaxPriceChange() {
    if (this.selectedMaxPrice < this.selectedMinPrice) {
      this.selectedMaxPrice = this.selectedMinPrice;
    }
    this.applyFilters();
  }
  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedCategory) count++;
    if (this.selectedGender) count++;
    if (this.selectedColor) count++;
    if (this.selectedSize) count++;
    if (this.selectedMinPrice < this.maxPrice) count++;
    return count;
  }
}
