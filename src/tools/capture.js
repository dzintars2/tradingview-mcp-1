import { z } from 'zod';
import { jsonResult } from './_format.js';
import * as core from '../core/capture.js';

export function registerCaptureTools(server) {
  server.tool('capture_screenshot', 'Take a screenshot of the TradingView chart', {
    region: z.string().optional().describe('Region to capture: full, chart, strategy_tester (default full)'),
    filename: z.string().optional().describe('Custom filename (without extension)'),
    method: z.string().optional().describe('Capture method: cdp (Page.captureScreenshot) or api (chartWidgetCollection.takeScreenshot) (default cdp)'),
    embed: z.coerce.boolean().optional().describe('Return the PNG inline as a viewable image (default false: returns file_path only, ~300 bytes). Set true to see the chart; costs ~400KB of context.'),
  }, async ({ region, filename, method, embed }) => {
    try {
      const result = await core.captureScreenshot({ region, filename, method, embed });
      if (result.image_base64) {
        const { image_base64, ...rest } = result;
        return {
          content: [
            { type: 'image', data: image_base64, mimeType: 'image/png' },
            { type: 'text', text: JSON.stringify(rest, null, 2) },
          ],
        };
      }
      return jsonResult(result);
    } catch (err) { return jsonResult({ success: false, error: err.message }, true); }
  });
}
