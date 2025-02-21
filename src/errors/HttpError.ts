import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import type { MojangPlayer } from "../mojang/MojangPlayer";

export class HttpError extends Error {
	private status: StatusCode

	constructor(message: string, status?: StatusCode) {
		super(message);
		this.status = status ?? 500
		this.name = "HttpError";
	}

    getStatus() {
        return this.status
    }

	toResponse(c: Context) {
        c.status(this.status)
		return c.json({
			error: this.name,
			message: this.message
		});
	}
}

export class PlayerHttpError extends HttpError {
    private player: MojangPlayer

    constructor(message: string, player: MojangPlayer, status?: StatusCode) {
        super(message, status);
        this.name = "PlayerHttpError"
        this.player = player;
    }

    toResponse(c: Context) {
        c.status(this.getStatus());
        return c.json({
            error: this.name,
            message: this.message,
            player: this.player
        });
    }
}


