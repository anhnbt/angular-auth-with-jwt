import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../core/services/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  constructor(public authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(resp => {
      console.log('header', resp);
    })
  }

  logout(): void {
    this.authService.logout('/');
  }

}
