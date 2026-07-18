import { Routes } from '@angular/router';
import { Home } from './features/home/pages/home';
import { Subscriptions } from './features/plans/pages/subscriptions/subscriptions';
import { Marketplace } from './features/marketplace/pages/marketplace/marketplace';

export const routes: Routes = [
    {
        path: "", component: Home
    },
    {
        path: "plans", component: Subscriptions 
    },
    {
        path: "marketplace/:caliber", component: Marketplace
    }
];
