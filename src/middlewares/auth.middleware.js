import { response } from "../utils/response.js";

//Hacemos una funcion que verifique que seas admin:
export function soloAdmin(req, res, next) {
    if(req.user.role === "admin" || req.user.role === "developer") {
        next();
    }else{
        response(res, 403, "Acceso denegado, solo admin..");
    }
}

//Hacemos una funcion que verifique que seas user:
export function soloUser(req, res, next) {
    if(req.user.role === "user" || req.user.role === "developer") {
        next();
    }else {
        response(res, 403, "Acceso denegado, solo usuarios..");
    }
}