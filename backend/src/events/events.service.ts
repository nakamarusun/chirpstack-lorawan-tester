import { Injectable } from '@nestjs/common';
import { Observable, Subject } from "rxjs";

@Injectable()
export class EventsService {

  subject: Subject<string> = new Subject<string>();

  advanceSubject(data: string) {
    this.subject.next(data);
  }

  listenToApp() : Observable<string> {
    return new Observable<string>((observer) => {
      // Simulate receiving data from the application
      setInterval(() => {
        observer.next("New packet received");
      }, 1000);
    });
  }
}
