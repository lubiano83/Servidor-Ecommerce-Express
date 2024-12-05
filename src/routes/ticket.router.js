import { Router } from "express";
import TicketController from "../controllers/ticket.controller.js";
import passport from "passport";
import { soloAdmin, soloUser } from "../middlewares/auth.middleware.js";

const ROUTER = Router();
const ticketController = new TicketController();
const permissions = passport.authenticate("current", { session: false });

ROUTER.get("/", ticketController.getTickets);
ROUTER.get("/:id", ticketController.getTicketById);
ROUTER.post("/", permissions, soloUser, ticketController.createTicket);

export default ROUTER;