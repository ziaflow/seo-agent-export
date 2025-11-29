import { r as require_token_util } from './chunk-SIW6CYO3.mjs';
import { _ as __commonJS, r as require_token_error } from './index.mjs';
import '@mastra/core/eval';
import '@mastra/core/hooks';
import '@mastra/core/storage';
import '@mastra/core/scores/scoreTraces';
import '@mastra/core/utils';
import '@mastra/core';
import '@mastra/core/error';
import '@mastra/loggers';
import '@mastra/mcp';
import 'inngest';
import 'zod';
import '@mastra/pg';
import '@inngest/realtime';
import '@mastra/inngest';
import '@mastra/core/agent';
import '@mastra/memory';
import './tools/fba6ed67-ff0c-4e79-bcbc-82d5ff4e6a16.mjs';
import '@mastra/core/tools';
import './tools/04971c3c-99b1-4fc5-a8c9-608b0dc36aba.mjs';
import './tools/bc07fac8-f513-4560-87b1-a57301fb216a.mjs';
import 'axios';
import './tools/4c991f0a-a147-4e9a-90ce-33a3b89bb825.mjs';
import './tools/0d3dc4e9-b0e6-4d31-b025-fe818b8b0793.mjs';
import './tools/b3e0fd61-b4b0-4b07-8358-e00e91a7efb7.mjs';
import './analyticsDb.mjs';
import 'pg';
import './tools/00555692-e9db-4c65-801b-22b7ea740eaa.mjs';
import './tools/f723efca-f7c8-4d70-9921-0754ca9d2382.mjs';
import './tools/3c4407a7-33a8-4689-a84d-08e0a8b46b7d.mjs';
import './tools/f890ff2e-d709-41df-81f4-925063725e10.mjs';
import '@modelcontextprotocol/sdk/client/index.js';
import '@modelcontextprotocol/sdk/client/stdio.js';
import '@ai-sdk/openai';
import './tools/e418ab85-8716-4802-ad54-68d9cf06bc29.mjs';
import './tools/b07da407-7ab1-4f14-9cb9-e58461845690.mjs';
import './tools/25ab84cd-1193-4c17-9840-6d2758df541e.mjs';
import './tools/f9b067d7-d546-43ba-81b4-61ee2dab1698.mjs';
import './tools/72871571-1936-4026-8611-eef96b57bd0c.mjs';
import './tools/11616161-1243-4617-89c9-6641ebe98af6.mjs';
import './tools/b127ffc0-f53b-458f-b12c-b77387095feb.mjs';
import './tools/605c1d05-86fd-46a3-8e03-36125f362d6d.mjs';
import './tools/d90f9f90-1353-476d-8c73-b2a62966badf.mjs';
import './tools/b24d3330-b826-46ee-8b39-bc0ea1686915.mjs';
import './tools/f6696b54-aa07-46f4-b929-62c3e28f1a76.mjs';
import './tools/a128fa3f-9f68-4fa9-9c8f-cf91bbfc0eac.mjs';
import './tools/de68fff8-71a4-4b00-98da-54304f1ed3f8.mjs';
import './tools/ac44276d-a0aa-4673-b535-2bf24c99ed09.mjs';
import 'crypto';
import 'fs/promises';
import 'https';
import 'path/posix';
import 'http';
import 'http2';
import 'stream';
import 'fs';
import 'path';
import '@mastra/core/runtime-context';
import '@mastra/core/telemetry';
import '@mastra/core/llm';
import '@mastra/core/stream';
import 'util';
import 'buffer';
import '@mastra/core/ai-tracing';
import '@mastra/core/utils/zod-to-json';
import '@mastra/core/a2a';
import 'stream/web';
import '@mastra/core/memory';
import 'zod/v4';
import 'zod/v3';
import 'child_process';
import 'module';
import 'os';
import '@mastra/core/workflows';
import './tools.mjs';

// ../../node_modules/.pnpm/@vercel+oidc@3.0.1/node_modules/@vercel/oidc/dist/token.js
var require_token = __commonJS({
  "../../node_modules/.pnpm/@vercel+oidc@3.0.1/node_modules/@vercel/oidc/dist/token.js"(exports, module) {
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var token_exports = {};
    __export(token_exports, {
      refreshToken: () => refreshToken
    });
    module.exports = __toCommonJS(token_exports);
    var import_token_error = require_token_error();
    var import_token_util = require_token_util();
    async function refreshToken() {
      const { projectId, teamId } = (0, import_token_util.findProjectInfo)();
      let maybeToken = (0, import_token_util.loadToken)(projectId);
      if (!maybeToken || (0, import_token_util.isExpired)((0, import_token_util.getTokenPayload)(maybeToken.token))) {
        const authToken = (0, import_token_util.getVercelCliToken)();
        if (!authToken) {
          throw new import_token_error.VercelOidcTokenError(
            "Failed to refresh OIDC token: login to vercel cli"
          );
        }
        if (!projectId) {
          throw new import_token_error.VercelOidcTokenError(
            "Failed to refresh OIDC token: project id not found"
          );
        }
        maybeToken = await (0, import_token_util.getVercelOidcToken)(authToken, projectId, teamId);
        if (!maybeToken) {
          throw new import_token_error.VercelOidcTokenError("Failed to refresh OIDC token");
        }
        (0, import_token_util.saveToken)(maybeToken, projectId);
      }
      process.env.VERCEL_OIDC_TOKEN = maybeToken.token;
      return;
    }
  }
});
var tokenWAEKDUVY = require_token();

export { tokenWAEKDUVY as default };
//# sourceMappingURL=token-WAEKDUVY.mjs.map
