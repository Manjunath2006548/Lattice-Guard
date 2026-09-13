const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.tex': 'text/plain'
};

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Function to scan active connected USB COM ports on Windows
function scanConnectedUsbPorts(callback) {
  const psCmd = `powershell -Command "Get-PnpDevice -Class Ports | Where-Object { $_.Present -eq $true } | Select-Object Name, InstanceId | ConvertTo-Json"`;
  exec(psCmd, (err, stdout, stderr) => {
    if (err || !stdout.trim()) {
      return callback([]);
    }
    try {
      let data = JSON.parse(stdout);
      if (!Array.isArray(data)) data = [data];
      const ports = data.map(d => {
        const match = d.Name.match(/\((COM\d+)\)/i);
        return {
          name: d.Name,
          port: match ? match[1].toUpperCase() : null,
          instanceId: d.InstanceId
        };
      }).filter(p => p.port !== null);
      callback(ports);
    } catch(e) {
      callback([]);
    }
  });
}

const server = http.createServer((req, res) => {
  // API: Scan active connected USB COM ports
  if (req.method === 'GET' && req.url === '/api/scan-ports') {
    scanConnectedUsbPorts(ports => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, ports }));
    });
    return;
  }

  // API: Native Avrdude Hardware Flasher
  if (req.method === 'POST' && req.url === '/api/flash-native-avrdude') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        let comPort = payload.comPort;
        const hexType = payload.hexType === 'trojan' ? 'trojan_uno.hex' : 'clean_uno.hex';
        const hexPath = path.join(__dirname, hexType);

        // Dynamically locate avrdude toolchain
        const avrdudeToolsDir = path.join(
          os.homedir(),
          'AppData', 'Local', 'Arduino15', 'packages', 'arduino', 'tools', 'avrdude'
        );

        let avrdudePath = null;
        let avrdudeConf = null;

        if (fs.existsSync(avrdudeToolsDir)) {
          const versions = fs.readdirSync(avrdudeToolsDir).filter(v =>
            fs.existsSync(path.join(avrdudeToolsDir, v, 'bin', 'avrdude.exe'))
          );
          if (versions.length > 0) {
            const chosenVersion = versions.sort().pop();
            avrdudePath = path.join(avrdudeToolsDir, chosenVersion, 'bin', 'avrdude.exe');
            avrdudeConf = path.join(avrdudeToolsDir, chosenVersion, 'etc', 'avrdude.conf');
          }
        }

        if (!avrdudePath || !fs.existsSync(avrdudePath)) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            error: `avrdude.exe toolchain not found on host machine. Make sure Arduino IDE is installed.`
          }));
        }

        if (!fs.existsSync(hexPath)) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: `Hex file not found: ${hexPath}` }));
        }

        // Helper function to execute avrdude flash
        const doFlash = (targetPort) => {
          const cmd = `"${avrdudePath}" -C "${avrdudeConf}" -c arduino -p m328p -P ${targetPort} -b 115200 -U flash:w:"${hexPath}":i`;
          console.log(`[AVRDUDE NATIVE EXEC] Flashing ${hexType} to ${targetPort}...`);

          exec(cmd, (error, stdout, stderr) => {
            const logOutput = (stderr + '\n' + stdout).trim();
            if (error) {
              console.log(`[AVRDUDE ERROR] ${logOutput}`);

              let friendlyError = logOutput;
              if (/could not open|Access is denied|Permission denied/i.test(logOutput)) {
                friendlyError = `Could not open ${targetPort}.\n\n💡 TROUBLESHOOTING CHECKLIST:\n1. Close Arduino IDE Serial Monitor & Serial Plotter so Windows releases ${targetPort}.\n2. Unplug and replug your Arduino USB cable.\n3. Make sure your USB cable is a DATA cable (not charge-only).\n\nRaw Error:\n${logOutput}`;
              } else if (/programmer is not responding|not in sync/i.test(logOutput)) {
                friendlyError = `Board did not respond on ${targetPort}.\n\n💡 TROUBLESHOOTING CHECKLIST:\n1. Press the RESET button on your Arduino right before flashing.\n2. If using a CH340 clone Arduino, install CH340 USB drivers.\n3. Try a different USB cable or USB port.\n\nRaw Error:\n${logOutput}`;
              }

              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ success: false, error: friendlyError, port: targetPort }));
            }

            console.log(`[AVRDUDE SUCCESS] 🟢 100% NATIVE AVRDUDE HARDWARE FLASH COMPLETE ON ${targetPort}! TX & L LEDs Flashed!`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, log: logOutput, port: targetPort }));
          });
        };

        // If comPort was specified, use it directly. Otherwise scan for active port.
        if (comPort && comPort !== 'AUTO') {
          doFlash(comPort);
        } else {
          scanConnectedUsbPorts(ports => {
            if (ports.length === 0) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({
                success: false,
                error: `🚨 NO PHYSICAL ARDUINO BOARD DETECTED ON USB PORT!\n\nWindows PnP scanner found 0 active connected USB serial ports.\n\n💡 FIX INSTRUCTIONS:\n1. Plug your Arduino board into your laptop using a DATA USB cable.\n2. Verify that the power LED on your Arduino board lights up.\n3. If using an Arduino clone board (CH340), install CH340 USB serial drivers for Windows.`
              }));
            }
            doFlash(ports[0].port);
          });
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  let reqUrl = req.url === '/' ? '/index.html' : req.url;
  let filePath = path.join(PUBLIC_DIR, reqUrl.split('?')[0]);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (indexErr, indexData) => {
          if (indexErr) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexData);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`=======================================================`);
  console.log(`🛡️ LATTICE GUARD SILICON SECURITY PLATFORM HOSTED LIVE!`);
  console.log(`👉 Local Access:   http://localhost:${PORT}`);
  console.log(`👉 Loopback:       http://127.0.0.1:${PORT}`);
  console.log(`👉 Network Access: http://${localIp}:${PORT}`);
  console.log(`=======================================================`);
});
