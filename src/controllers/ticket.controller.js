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

    createTicket = async (req, res) => {
        try {
            const { amount } = req.body;
            const purchaser = req.user.id;
            if (!amount || !purchaser) return res.status(400).json({ message: "Faltan datos obligatorios: amount y purchaser" });
            const ticketData = { amount, purchaser };
            const ticket = await ticketDao.createTicket(ticketData);
            return res.status(201).json({ message: "Ticket creado con éxito", ticket });
        } catch (error) {
            return res.status(500).json({ message: "Error al crear el ticket", error: error.message });
        }
    };    
}