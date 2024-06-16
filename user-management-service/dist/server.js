"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const amqplib_1 = __importDefault(require("amqplib"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    try {
        const user = yield prisma.user.create({ data: { name, email } });
        const connection = yield amqplib_1.default.connect(process.env.RABBITMQ_URL);
        const channel = yield connection.createChannel();
        yield channel.assertQueue("user-actions");
        channel.sendToQueue("user-actions", Buffer.from(JSON.stringify({
            action: "CREATE_USER",
            user,
        })));
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
app.get("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json("Hello world!");
}));
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
