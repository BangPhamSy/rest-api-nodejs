import 'dotenv/config';

import App from './app';
import { IndexRoute } from '@modules/index';
import { UserRoute } from '@modules/users';
import { validateEnv } from '@core/utils';
import { AuthRoute } from '@modules/auth';

validateEnv();
const routes = [
    new IndexRoute(),
    new UserRoute(),
    new AuthRoute()
];
const app = new App(routes);
app.listen();


