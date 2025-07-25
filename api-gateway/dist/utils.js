"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRoutes = void 0;
var config_json_1 = __importDefault(require("./config.json"));
var configureRoutes = function (app) {
    Object.entries(config_json_1.default.Service).forEach(function (_a) {
        var name = _a[0], service = _a[1];
        // const hostname= service.url;
        // service.routes.forEach((route)=>{
        //     route.methods.forEach((method)=>{
        //         console.log(method, route.path, hostname)
        //     })
        // })
        console.log(name, service);
    });
};
exports.configureRoutes = configureRoutes;
