import { handleMcp } from '../lib/mcp.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  return handleMcp(req, res);
}
