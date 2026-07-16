import { Routes } from '@angular/router';
import { Home } from './features/home/pages/home';
import { Subscriptions } from './features/plans/pages/subscriptions/subscriptions';

export const routes: Routes = [
    {
        path: "", component: Home
    },
    {
        path: "plans", component: Subscriptions 
    }
];
