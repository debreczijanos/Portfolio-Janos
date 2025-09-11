import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  // Backend endpoint (PHP): place contact.php at your web root
  private endpoint = '/contact.php';

  constructor(private http: HttpClient) {}

  send(payload: ContactPayload): Observable<unknown> {
    return this.http.post(this.endpoint, payload, { responseType: 'text' });
  }
}
