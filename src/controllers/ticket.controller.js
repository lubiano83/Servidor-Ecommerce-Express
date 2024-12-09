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

    getTicketById = async(req, res) => {
        try {
            const { id } = req.params;
            const ticket = await ticketDao.getTicketById( id );
            return res.status(200).send({ ticket });
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener el ticket por el id", error: error.message });
        }
    }
    
    deleteTicketById = async(req, res) => {
        try {
            const { id } = req.params;
            const ticket = await ticketDao.getTicketById(id);
            if(!ticket) return res.send({ message: "El ticket no existe" });
            const ticketDeleted = await ticketDao.deleteTicketById(id);
            return res.status(200).send({ message: "Ticket eliminado con exito", ticketDeleted })
        } catch (error) {
            return res.status(500).json({ message: "Error al eliminar el ticket por el id", error: error.message });
        }
    }
}