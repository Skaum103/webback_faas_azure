// src/utils/streamToJson.js
async function streamToJson(readable) {
    const chunks = [];
    for await (const chunk of readable) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const buffer = Buffer.concat(chunks);
    try {
      return JSON.parse(buffer.toString('utf-8'));
    } catch (e) {
      throw new Error('Failed to parse JSON body: ' + e.message);
    }
  }
  
  module.exports = streamToJson;
  