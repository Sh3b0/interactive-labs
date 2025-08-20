import * as express from "express"
import * as http from "http"
import * as path from "path"
import * as cors from "cors"
import * as morgan from "morgan"
import * as url from "url"

import { setup_terminals, terminals } from "./modules/terminals"
import { setup_messages, messages } from "./modules/messages"
import { setup_dashboard } from "./modules/dashboard"
import { setup_assets } from "./modules/assets"
// import { setup_examiner } from "./modules/examiner"
import { setup_workshop, setup_workshop_config } from "./modules/workshop"
import { setup_routing } from "./modules/routing"

import { logger } from "./modules/logger"
import { config } from "./modules/config"

const BASEDIR = path.dirname(path.dirname(__dirname))

const GATEWAY_PORT = parseInt(process.env.GATEWAY_PORT || "10081")

const app = express()

const server = http.createServer(app)

app.set("views", path.join(BASEDIR, "src/backend/views"))
app.set("view engine", "pug")

app.locals.config = config

// Disable CORS for development
app.use("*", cors())

// Add logging for request.
const LOG_FORMAT = process.env.LOG_FORMAT || 'dev'

app.use(morgan(LOG_FORMAT))

// When running in Kubernetes we are always behind a proxy, so trust headers.

app.set("trust proxy", true)

function setup_signals() {
    process.on("SIGTERM", () => {
        logger.info("Starting shutdown.")
        logger.info("Closing HTTP server.")

        terminals.close_all_sessions()

        server.close(() => {
            logger.info("HTTP server closed.")
            process.exit(0)
        })
    })
}

function start_http_server() {
    server.listen(GATEWAY_PORT, () => {
        logger.info(`HTTP server running on port ${GATEWAY_PORT}.`)
    })
}

// Setup everything and start listener
async function main() {
    try {
        let oauth2_client: any

        setup_signals()
        setup_workshop_config(app, config.config_password)
        // setup_examiner(app, config.services_password)
        setup_messages(app, server, config.services_password)
        setup_assets(app)
        setup_workshop_config(app)
        setup_terminals(app, server)
        setup_workshop(app)
        // setup_examiner(app)
        setup_messages(app, server)
        setup_dashboard(app, oauth2_client)
        setup_routing(app)

        server.on("upgrade", (req, socket, head) => {
            let parsedUrl = url.parse(req.url, true)
            if (terminals.is_enabled() && parsedUrl.pathname == "/terminal/server") {
                terminals.session_manager().handle_upgrade(req, socket, head)
            } else if (terminals.is_enabled() && parsedUrl.pathname == "/message/server") {
                messages.session_manager().handle_upgrade(req, socket, head)
            }
        })

        start_http_server()
    } catch (error) {
        logger.error("Unexpected error occurred", error)
    }
}

main()
