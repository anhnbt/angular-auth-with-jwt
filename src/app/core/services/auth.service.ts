import {Injectable} from '@angular/core';
import {LocalStorageService} from "./local-storage.service";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {environment} from "../../../environments/environment";
import {DatePipe} from "@angular/common";

interface User {
  username: string,
  email: string,
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isAuthenticated$ = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
  public isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private localStorageService: LocalStorageService,
    private http: HttpClient,
    private router: Router,
    private datePipe: DatePipe
  ) {
  }

  async login(request: { username: string, password: string }): Promise<void> {
    this.isLoading$.next(true);
    const resp = await this.http.post<any>(`${environment.apiUrl}/auth/login`, request).toPromise();
    if (resp.status === 'OK') {
      this.isLoading$.next(false);
      this.isAuthenticated$.next(resp.data);
      this.saveLocalAndRedirect(resp.data);
    } else {
      this.isLoading$.next(false);
      throw Error(resp.message);
    }
  }

  logout(redirect: string): void {
    this.localStorageService.delete('airbnb_account');
    this.isAuthenticated$.next(null);
    this.router.navigate([redirect]);
  }

  isLoggedIn(): boolean {
    const token = this.getAuthorizationToken();
    if (!token) return false;
    const jwtToken = JSON.parse(atob(token.split('.')[1]));
    console.log('Ngày giờ hiện tại: ', this.datePipe.transform(Date.now(), 'yyyy/MM/dd HH:mm:ss'));
    console.log('Ngày giờ hết hạn token: ', this.datePipe.transform(jwtToken.exp * 1000, 'yyyy/MM/dd HH:mm:ss'));
    const tokenExpired = Date.now() > (jwtToken.exp * 1000);
    return !tokenExpired;

  }

  saveLocalAndRedirect(user: object): void {
    this.localStorageService.set('airbnb_account', user);
    this.router.navigate(['/']);
  }

  getUserFromLocalStorage(): User {
    return this.localStorageService.get('airbnb_account');
  }

  getAuthorizationToken(): string | null {
    if (this.getUserFromLocalStorage()) {
      return this.getUserFromLocalStorage().token;
    } else {
      return null;
    }
  }
}
