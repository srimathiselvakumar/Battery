const express = require('express');
const router = express.Router();
const http = require('http');

/**
 * ThingSpeak compatible update route
 * Allows standard ESP32 ThingSpeak libraries to post directly to this server:
 * GET /update?api_key=XYZ&field1=32.4&field2=215
 * POST /update with field1 & field2
 */
const handleThingSpeakUpdate = async (req, res) => {
  try {
    const field1 = req.query.field1 || req.body.field1; // Temperature (°C)
    const field2 = req.query.field2 || req.body.field2; // MQ-2 Gas (ppm)

    if (field1 === undefined && field2 === undefined) {
      return res.status(400).send('0');
    }

    const temp = parseFloat(field1) || 31.0;
    const gas = parseFloat(field2) || 200.0;

    // Forward internally to /api/telemetry logic
    const telemetryRouter = req.app._router.stack.find(
      layer => layer.route && layer.route.path === '/api/telemetry'
    );

    // Call standard telemetry creation via local request
    const postData = JSON.stringify({
      deviceId: 'ESP32-THINGSPEAK-NODE',
      temperature: temp,
      gasPpm: gas
    });

    const options = {
      hostname: '127.0.0.1',
      port: process.env.PORT || 5000,
      path: '/api/telemetry',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const internalReq = http.request(options, internalRes => {
      let body = '';
      internalRes.on('data', chunk => { body += chunk; });
      internalRes.on('end', () => {
        // ThingSpeak returns an entry ID number (e.g. 1, 2, 3...)
        res.status(200).send(String(Date.now()));
      });
    });

    internalReq.on('error', () => {
      res.status(200).send('1');
    });

    internalReq.write(postData);
    internalReq.end();
  } catch (err) {
    res.status(500).send('0');
  }
};

router.get('/update', handleThingSpeakUpdate);
router.post('/update', handleThingSpeakUpdate);

module.exports = router;
