import "dotenv/config";

import App from "./app";
import { IndexRoute } from "@modules/index";
import { UserRoute } from "@modules/users";
import { validateEnv } from "@core/utils";
import { AuthRoute } from "@modules/auth";
import { ProfileRoute } from "@modules/profile";
import { PostRoute } from "@modules/posts";

validateEnv();
const routes = [
  new IndexRoute(),
  new UserRoute(),
  new AuthRoute(),
  new ProfileRoute(),
  new PostRoute(),
];
const app = new App(routes);
app.listen();
