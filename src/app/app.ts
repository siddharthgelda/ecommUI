import { Component, signal } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss'

})
export class App {
  protected readonly title = signal('shoppbp-ecommerce');
}
