import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.scss']
})
export class NotfoundComponent implements OnInit, OnDestroy {
    previousUrl: string;
    $notFound: Subscription

    constructor(
        private router: Router
    ) { 
        this.$notFound = router.events
        .pipe(
            filter(event => event instanceof NavigationEnd)
        )
        .subscribe((event: any) => {
            this.previousUrl = 'https://'+window.location.host+event.url
        })
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.$notFound.unsubscribe()
    }
}
