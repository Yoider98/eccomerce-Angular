import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CartService } from "src/app/services/cart.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-detail-product",
  templateUrl: "./detail-product.component.html",
  styleUrls: ["./detail-product.component.css"],
})
export class DetailProductComponent {
  quantity: number = 1;
  selectedSize: string = "";
  selectedColor: string = "";
  selectedSizeStock: number | null = null;
  availableColors: string[] = [];
  showSizeGuide = false;
  sizeTable: string[][] = [];
  availableStock: number = 0; 

  constructor(
    private cartService: CartService,
    public dialogRef: MatDialogRef<DetailProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.loadSizeTable();
  }
  ngOnInit(): void {
    if (this.data.product.sizes.length > 0) {
      this.selectSize(this.data.product.sizes[0]);
    }
  }

  selectSize(size: any): void {
    this.selectedSize = size.valor;
    this.availableColors = size.colors.map(c => c.color);
    if (this.availableColors.length > 0) {
      this.selectedColor = this.availableColors[0];
    }
    this.availableStock = size.colors.reduce((acc, curr) => acc + curr.cant, 0);
  }

  getAvailableStock(): number {
    if (!this.selectedSize || !this.selectedColor) return 0;
    const size = this.data.product.sizes.find(s => s.valor === this.selectedSize);
    if (!size) return 0;
    const color = size.colors.find(c => c.color === this.selectedColor);
    return color ? color.cant : 0;
  }

  loadSizeTable(): void {
    const category = this.data.product.category;

    if (category === "calzado") {
      this.sizeTable = [
        ["36", "22.5"],
        ["37", "23.5"],
        ["38", "24"],
        ["39", "25"],
        ["40", "25.5"],
        ["41", "26.5"],
        ["42", "27"],
        ["43", "28"],
      ];
    } else if (
      category === "ropa" &&
      this.data.product.subcategory === "vestidos"
    ) {
      this.sizeTable = [
        ["S", "84-88", "64-68", "88-92"],
        ["M", "88-92", "68-72", "92-96"],
        ["L", "92-96", "72-76", "96-100"],
        ["XL", "96-100", "76-80", "100-104"],
      ];
    } else {
      this.sizeTable = [["No hay guía disponible para esta categoría"]];
    }
  }

  updateStockLabel(): void {
    const sizeObj = this.data.product.sizes.find(
      (s: any) => s.valor === this.selectedSize
    );
    this.selectedSizeStock = sizeObj ? sizeObj.cant : null;
  }


  closeModal(): void {
    this.dialogRef.close();
  }
  addToCart(): void {
    if (!this.selectedSize || !this.selectedColor) {
      Swal.fire({
        icon: "warning",
        title: "Faltan opciones",
        text: "Por favor selecciona una talla y un color",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const availableStock = this.getAvailableStock();
    if (this.quantity > availableStock) {
      Swal.fire({
        icon: "error",
        title: "Stock insuficiente",
        text: `Solo hay ${availableStock} unidades disponibles en talla ${this.selectedSize} y color ${this.selectedColor}.`,
        confirmButtonColor: "#d33",
      });
      return;
    }

    this.cartService.addToCart(
      this.data.product,
      this.quantity,
      this.selectedSize,
      this.selectedColor
    );

    Swal.fire({
      icon: "success",
      title: "¡Agregado al carrito!",
      text: "El producto se ha agregado correctamente",
      timer: 2000,
      showConfirmButton: false,
    });

    this.dialogRef.close();
  }

  get total(): number {
    return this.quantity * this.data.product.price;
  }
  increaseQuantity(): void {
    if (this.quantity < this.getAvailableStock()) {
      this.quantity++;
    }
  }

  deincreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  validateQuantity(): void {
    if (this.quantity > this.getAvailableStock()) {
      this.quantity = this.getAvailableStock();
    } else if (this.quantity < 1) {
      this.quantity = 1;
    }
  }
}
