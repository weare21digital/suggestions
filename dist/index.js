"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.SuggestionServiceError = exports.SuggestionService = void 0;
// Core exports
__exportStar(require("./lib/types"), exports);
__exportStar(require("./lib/parse-replies"), exports);
var suggestion_service_1 = require("./lib/suggestion-service");
Object.defineProperty(exports, "SuggestionService", { enumerable: true, get: function () { return suggestion_service_1.SuggestionService; } });
Object.defineProperty(exports, "SuggestionServiceError", { enumerable: true, get: function () { return suggestion_service_1.SuggestionServiceError; } });
Object.defineProperty(exports, "ERROR_CODES", { enumerable: true, get: function () { return suggestion_service_1.ERROR_CODES; } });
