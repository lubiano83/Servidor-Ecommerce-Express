import { Router } from "express";
import TicketController from "../controllers/ticket.controller.js";

const ticketController = new TicketController();

const ROUTER = Router();

ROUTER.get("/", ticketController.getTickets);

export default ROUTER;