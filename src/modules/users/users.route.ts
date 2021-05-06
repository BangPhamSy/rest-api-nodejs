import { Route } from "@core/interfaces";
import { Router } from "express";
import UsersController from "./users.controller";


export default class UsersRoute implements Route {
    public path = '/api/users';
    public router = Router(); 
    public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(this.path, this.usersController.index);
  }
}