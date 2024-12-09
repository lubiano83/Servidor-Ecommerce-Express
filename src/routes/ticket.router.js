import { Router } from "express";
import TicketController from "../controllers/ticket.controller.js";
import passport from "passport";
import { soloAdmin } from "../middlewares/auth.middleware.js";

const ROUTER = Router();
const ticketController = new TicketController();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", permissions, soloAdmin, ticketController.getTickets);
ROUTER.get("/:id",permissions, soloAdmin, ticketController.getTicketById);
ROUTER.post("/:id", permissions, soloAdmin, ticketController.deleteTicketById);

export default ROUTER;