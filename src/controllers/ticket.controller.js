import TicketDao from "../dao/ticket.dao.js";

const ticketDao = new TicketDao();

export default class TicketController {

    getTickets = async(req, res) => {
        try {
            const ticket = await ticketDao.getTickets();
            return res.status(200).send({ ticket });
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener los tickets", error: error.message });
        }
    }
}