import { Component } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  loading: boolean = false;
  errorMessage: string = "";
  showErrorModal: boolean = false;
  showSuccessNotification: boolean = false;
  showChangeSuccessNotification: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  isLogin: boolean = true;
  showModal: boolean = false;
  resetEmail: string = "";
  rememberMe: boolean = false;

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });

    this.registerForm = this.fb.group(
      {
        name: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, this.passwordValidator]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordValidator(control: AbstractControl) {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const valid = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
    return valid ? null : { passwordStrength: true };
  }

  passwordMatchValidator(group: AbstractControl) {
    const password = group.get("password")?.value;
    const confirmPassword = group.get("confirmPassword")?.value;

    if (password !== confirmPassword) {
      group.get("confirmPassword")?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = "";

    const { email, password } = this.loginForm.value;
    console.log('Intentando login con:', { email });

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        console.log("Respuesta del servidor:", response);
        this.loading = false;
        
        if (response && response.token) {
          console.log("Login exitoso, token recibido");
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigate([returnUrl]);
        } else {
          console.log("Login fallido, respuesta sin token");
          Swal.fire({
            icon: 'error',
            title: 'Error de inicio de sesión',
            text: 'Credenciales inválidas',
            confirmButtonText: 'Entendido'
          });
        }
      },
      error: (error) => {
        this.loading = false;
        //console.error('Error completo:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error de inicio de sesión',
          text: error.message || 'Ha ocurrido un error al intentar iniciar sesión',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  onRegisterSubmit() {
    if (this.registerForm.invalid){
      const formErrors = [];
      
      if (this.registerForm.get('name')?.errors) {
        if (this.registerForm.get('name')?.errors['required']) {
          formErrors.push('El nombre es requerido');
        }
        if (this.registerForm.get('name')?.errors['minlength']) {
          formErrors.push('El nombre debe tener al menos 3 caracteres');
        }
      }

      if (this.registerForm.get('email')?.errors) {
        if (this.registerForm.get('email')?.errors['required']) {
          formErrors.push('El correo electrónico es requerido');
        }
        if (this.registerForm.get('email')?.errors['email']) {
          formErrors.push('Ingrese un correo electrónico válido');
        }
      }

      if (this.registerForm.get('password')?.errors) {
        if (this.registerForm.get('password')?.errors['required']) {
          formErrors.push('La contraseña es requerida');
        }
        if (this.registerForm.get('password')?.errors['passwordStrength']) {
          formErrors.push('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
        }
      }

      if (this.registerForm.get('confirmPassword')?.errors) {
        if (this.registerForm.get('confirmPassword')?.errors['required']) {
          formErrors.push('La confirmación de contraseña es requerida');
        }
        if (this.registerForm.get('confirmPassword')?.errors['passwordMismatch']) {
          formErrors.push('Las contraseñas no coinciden');
        }
      }

      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        html: formErrors.join('<br>'),
        confirmButtonText: 'Entendido'
      });
    }else{
      this.loading = true;
      this.errorMessage = "";
  
      const { name, email, password } = this.registerForm.value;
  
      this.authService.register({ name, email, password }).subscribe(
        (response) => {
          this.loading = false;
          if (response && response.token) {
            this.showSuccessNotification = true;
            this.authService.saveInfoSession(response.token, response.user)
            setTimeout(() => {
              const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
              this.router.navigate([returnUrl]);
            }, 1000);
          }
        },
        (error) => {
          this.loading = false;
          this.showError(
            error.error.error.message || "Error en el registro"
          );
        }
      );
    }
  }

  sendPasswordReset() {
    if (!this.resetEmail) {
      this.showError("Por favor ingresa tu correo electrónico");
      return;
    }

    this.loading = true;
    this.errorMessage = "";

    this.authService.resetPassword(this.resetEmail).subscribe(
      (response) => {
        this.loading = false;
        this.showModal = false;
        console.log("response -> ", response)
        if(response.status == "success"){
          this.showChangeSuccessNotification = true;
          setTimeout(() => {
            this.showChangeSuccessNotification = false;
          }, 3000);
        }else{
          Swal.fire({
            icon: 'error',
            title: 'Error al cambiar contraseña',
            text: response.message || 'Ha ocurrido un error al cambiar contraseña',
            confirmButtonText: 'Entendido'
          });
        }

      },
      (error) => {
        this.loading = false;
        this.showError(
          error.error.error.message || "Error al restablecer la contraseña"
        );
      }
    );
  }

  showError(message: string) {
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  closeModal() {
    this.showErrorModal = false;
    this.errorMessage = "";
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleForm() {
    this.isLogin = !this.isLogin;
    this.errorMessage = "";
    this.showErrorModal = false;
  }

  openForgotPasswordModal() {
    this.showModal = true;
    this.resetEmail = "";
  }

  closeForgotPasswordModal() {
    this.showModal = false;
    this.resetEmail = "";
  }

}

