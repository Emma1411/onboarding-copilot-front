import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AskResponse } from '@interfaces/ask.interface';
import { HealthResponse } from '@interfaces/health.interface';
import { AdrDetail, AdrSummary } from '@interfaces/adr.interface';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  ask(question: string): Observable<AskResponse> {
    return this.http.post<AskResponse>(`${this.base}/api/ask`, { question });
  }

  health(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.base}/api/health`);
  }

  listAdrs(): Observable<AdrSummary[]> {
    return this.http.get<AdrSummary[]>(`${this.base}/api/docs`);
  }

  getAdr(id: number): Observable<AdrDetail> {
    return this.http.get<AdrDetail>(`${this.base}/api/docs/${id}`);
  }
}