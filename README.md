# Lattice-Guard: Hardware Security & Watchdog Monitoring Platform

Lattice-Guard is a lightweight dual-core hardware monitoring architecture designed to protect digital VLSI systems against **Hardware Trojans** and **accidental data corruption**.

## 🚀 Quick Start Instructions

1. **Prerequisites:** Make sure you have [Node.js](https://nodejs.org/) installed.
2. **Start the Web Application:**
   ```bash
   node server.js
   ```
3. **Open in Browser:**
   Go to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

- `index.html` — Complete 5-phase interactive web application UI, oscilloscope engine, custom Trojan generator, formal verification log, and Phase 5 hardware board deployment.
- `server.js` — Standalone zero-dependency Node.js HTTP web server.
- `package.json` — NPM project configuration file.
- `generate_pdf.js` — Script to export printable explanation documents.

---

## 🌟 Key Features

- **Phase 0:** Introduction & Executive Benchmark Stats (-41.2% Area Savings, <0.4ns Latency).
- **Phase 1:** Dual-Core Topology (16-bit Master Core vs 8-bit Shadow Core) with Live Calculated Value Displays.
- **Phase 2:** 6-Channel Oscilloscope @ 60 FPS, 8 Preset Attacks + Custom Trojan Injection Studio.
- **Phase 3:** Vivado Synthesis Resource Comparison & Dynamic Hardware Bit-Width Slider.
- **Phase 4:** SystemVerilog Assertion (SVA IEEE 1800-2017) Formal Verification Log & Security Certificate.
- **Phase 5:** Universal Hardware Board Deployment (Arduino, ESP32, Raspberry Pi, FPGA Verilog, STM32) with Web Serial USB Monitoring.
