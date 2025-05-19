import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { BannerService } from "src/app/services/banner.service";
import { CartService } from "src/app/services/cart.service";
import { ProductService } from "src/app/services/product.service";
import Swal from "sweetalert2";
import SwiperCore, { Autoplay } from 'swiper/core';
SwiperCore.use([Autoplay]);
// Importa tus servicios de productos y categorías si los tienes

export interface Slide {
  id: number;
  link: string;
  title: string;
  endDate: Date;
  startDate: Date;
  active: boolean;
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  categories = [
    { name: "Hombre", value: "hombre", img: "assets/categoria-hombre.jpg" },
    { name: "Mujer", value: "mujer", img: "assets/categoria-mujer.jpg" },
    { name: "Niños", value: "ninos", img: "assets/categoria-ninos.jpg" },
    // ... agrega más según tu catálogo
  ];

  isModalOpen = false;
modalProduct: any = null;
modalAvailableSizes: any[] = [];
modalSelectedSize: any = null;
modalSelectedColor: string = '';
modalSelectedColorObj: any = null;

  products: any[] = [];
  /*products = [
    { name: 'Camisa Tropical', price: 35000, image: "assets/testimonials/ana.jpg" },
    { name: 'Short Playero',  price: 28000, image: "assets/testimonials/carlos.jpg" },
    {  name: 'Gorra Sol', price: 15000, image: "assets/testimonials/maria.jpg" },
    { name: 'Camisa Tropical', price: 35000, image: "assets/testimonials/ana.jpg" },
    { name: 'Short Playero',  price: 28000, image: "assets/testimonials/carlos.jpg" },
    {  name: 'Gorra Sol', price: 15000, image: "assets/testimonials/maria.jpg" },

  ];*/

  testimonials = [
    {
      name: 'Ana López',
      comment: '¡Me encantó la calidad y el diseño!',
      stars: 5,
      photo: 'assets/testimonials/ana.jpg'
    },
    {
      name: 'Carlos Pérez',
      comment: 'El envío fue rapidísimo y el producto excelente.',
      stars: 4,
      photo: 'assets/testimonials/carlos.jpg'
    },
    {
      name: 'María García',
      comment: 'Muy buena atención al cliente. ¡Repetiré!',
      stars: 5,
      photo: 'assets/testimonials/maria.jpg'
    },
    {
      name: 'Ana López',
      comment: '¡Me encantó la calidad y el diseño!',
      stars: 5,
      photo: 'assets/testimonials/ana.jpg'
    },
    {
      name: 'Carlos Pérez',
      comment: 'El envío fue rapidísimo y el producto excelente.',
      stars: 4,
      photo: 'assets/testimonials/carlos.jpg'
    },
    {
      name: 'María García',
      comment: 'Muy buena atención al cliente. ¡Repetiré!',
      stars: 5,
      photo: 'assets/testimonials/maria.jpg'
    }
    // Agrega más testimonios si quieres
  ];
  
  currentTestimonial = 0;
  email: string = '';
  constructor(private router: Router, private productService: ProductService,private cartService: CartService,) {}

  ngOnInit(): void {
    this.loadOutstandingProducts();
  }

  loadOutstandingProducts() {
    this.productService.getProducts().subscribe(
      (response: any) => {
        // Ajusta según la estructura de tu respuesta
        this.products = response.data
          ? response.data.filter((p: any) => p.outstanding === true)
          : [];
      },
      (error) => {
        console.error("Error al cargar productos destacados:", error);
      }
    );
  }
  
  goToShop() {
    this.router.navigate(["/shop"]);
  }

  getSlidesPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }


  goToCategory(cat: any) {
    this.router.navigate(["/shop"], { queryParams: { gender: cat.value } });
  }

  addToCart(product: any) {
   
  }

  // Abre el modal y carga las tallas disponibles
openProductModal(product: any) {
  this.modalProduct = product;
  this.isModalOpen = true;
  this.modalAvailableSizes = product.sizes || [];
  this.modalSelectedSize = null;
  this.modalSelectedColor = '';
}

// Cierra el modal
closeModal() {
  this.isModalOpen = false;
  this.modalProduct = null;
  this.modalAvailableSizes = [];
  this.modalSelectedSize = null;
  this.modalSelectedColor = '';
}

// Selecciona talla
selectSize(size: any) {
  this.modalSelectedSize = size.valor;
  this.modalSelectedColor = '';
}

// Devuelve los colores disponibles para la talla seleccionada
getColorsForSelectedSize() {
  if (!this.modalProduct || !this.modalProduct.sizes) return [];
  const sizeObj = this.modalProduct.sizes.find((s: any) => s.valor === this.modalSelectedSize);
  return sizeObj ? sizeObj.colors : [];
}

// Selecciona color
selectColor(color: string) {
  this.modalSelectedColor = color;
}

// Devuelve el stock disponible para la talla y color seleccionados
getAvailableStock(sizeValor: string, color: string) {
  const sizeObj = this.modalProduct.sizes.find((s: any) => s.valor === sizeValor);
  if (!sizeObj) return 0;
  const colorObj = sizeObj.colors.find((c: any) => c.color === color);
  return colorObj ? colorObj.cant : 0;
}

// Estilo para el botón de color
getColorStyle(color: string) {
  return { 'background-color': color };
}

// Confirmar selección (agregar al carrito)
confirmSelection() {
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


hasStockForSize(size: any): boolean {
  // Si el objeto size tiene un array de colores, revisa si alguno tiene stock
  if (!size.colors || !Array.isArray(size.colors)) return false;
  return size.colors.some((color: any) => color.cant > 0);
}

subscribe() {
  if (this.email && this.email.includes('@')) {
    // Aquí puedes llamar a tu servicio para guardar el email si tienes backend
    alert('¡Gracias por suscribirte! Pronto recibirás nuestras novedades.');
    this.email = '';
  } else {
    alert('Por favor, ingresa un correo válido.');
  }
}
}
