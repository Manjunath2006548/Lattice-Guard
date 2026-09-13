# Lattice-Guard: Sub-Nanosecond Asymmetric Dual-Core Architecture for Multi-Vector Hardware Trojan Isolation

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FPGA Target](https://img.shields.io/badge/FPGA-AMD%20Xilinx%20Artix--7-orange.svg)]()
[![Verification](https://img.shields.io/badge/Verification-SystemVerilog%20SVA-teal.svg)]()
[![Paper](https://img.shields.io/badge/IEEE-6--Page%20Publication%20PDF-red.svg)](Lattice_Guard_IEEE_Paper.pdf)

> **Lattice-Guard** is a sub-nanosecond asymmetric dual-core hardware monitoring architecture designed to detect and isolate multi-vector Hardware Trojans (HTs) with minimal silicon area overhead. By pairing a 16-bit high-precision Master Core with an 8-bit quantized approximation Shadow Core, Lattice-Guard achieves real-time anomaly detection with a **41.2% reduction in Look-Up Table (LUT) area utilization** and a **43.1% reduction in dynamic power dissipation** compared to conventional Dual Modular Redundancy (DMR).

---

## 🌟 Key Architecture & Microarchitectural Highlights

```
                        16-Bit Input Sensor Bus X(t)
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌───────────────────────┐                           ┌────────────────────┐
│ 16-Bit Master Core    │                           │ 8-Bit Shadow Core  │
│ Y_master = f_master(X)│                           │ Y_shadow = Q8(f)   │
└──────────┬────────────┘                           └──────────┬─────────┘
           │                                                   │
           └─────────────────────────┬─────────────────────────┘
                                     ▼
                      ┌─────────────────────────────┐
                      │ Sub-ns Feature Comparator   │
                      │ Δ(t) = |Y_master - Y_shadow|│
                      └──────────────┬──────────────┘
                                     ▼
                      ┌─────────────────────────────┐
                      │ Threshold Decision Engine   │
                      │ Is Δ(t) > 0.120? ──► ALARM! │
                      └─────────────────────────────┘
```

- **Asymmetric Master-Shadow Topology**: Pairs a 16-bit Master Core with an 8-bit quantized Shadow Core ($f_{\text{shadow}}$), achieving an 85.0% ALU gate-count reduction in the shadow processing pipeline.
- **Sub-Nanosecond Isolation Latency**: Combinational subtractor tree propagation delay of **0.39 ns** on AMD Xilinx Artix-7 28nm FPGA at 200 MHz clock frequency.
- **Formal Assertion Verification**: Verified using SystemVerilog Assertions (SVA) within the SymbiYosys (SBY) framework and Z3 SMT solver, proving **0.00% false negatives** across $k=50$ cycles.
- **Universal Multi-Board USB Flasher**: Web Serial USB interface supporting 5 target hardware microcontroller families (Arduino AVR, ESP32, RP2040, Artix-7 FPGA, STM32 ARM).
- **Live AI Code Inspector**: Regex pattern matching engine identifying 9 distinct Trojan attack vectors directly above the web editor.

---

## 📊 Microarchitectural Synthesis Results (Vivado 2024.1 @ 200 MHz)

| Performance Parameter | Unmonitored Core | DMR Dual Core | Proposed Lattice-Guard | Savings vs. DMR |
|---|---|---|---|---|
| **LUT Utilization** | 1,200 | 2,420 | **1,420** | **-41.2%** |
| **Flip-Flops (FF)** | 660 | 1,320 | **780** | **-40.9%** |
| **Dynamic Power (mW)** | 10.2 mW | 21.8 mW | **12.4 mW** | **-43.1%** |
| **Propagation Latency** | N/A | 0.92 ns | **0.39 ns** | **-57.6%** |
| **Formal Verification** | None | Partial | **SystemVerilog SVA (k=50)** | **0.00% False Negatives** |

---

## 📂 Project Repository Structure

```
├── index.html                  # Standalone Web Application UI (Code Studio, AI Inspector, Flasher, Oscilloscope)
├── server.js                   # Node.js HTTP Backend Server & Native AVRDUDE Hardware Flashing API
├── Lattice_Guard_IEEE_Paper.tex# IEEE 6-Page Conference Research Paper LaTeX Source File
├── Lattice_Guard_IEEE_Paper.pdf# Compiled 6-Page IEEE Conference Research Paper PDF
├── build_6page_pdf.js          # Automated Puppeteer script to compile the 6-Page IEEE PDF
├── clean_uno.hex               # Pre-compiled AVR Hex Binary for Clean Baseline Execution
├── trojan_uno.hex              # Pre-compiled AVR Hex Binary for Bit-Flip Trojan Execution
├── package.json                # Node.js project manifest & build scripts
├── LICENSE                     # MIT Open Source License
└── README.md                   # Complete GitHub Repository Overview & Documentation
```

---

## ⚡ Quick Start & Deployment Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- Google Chrome or Microsoft Edge (for Web Serial USB API support)

### Installation & Execution
```bash
# 1. Clone repository
git clone https://github.com/your-username/Lattice-Guard.git
cd Lattice-Guard

# 2. Install dependencies
npm install

# 3. Start the Lattice-Guard security server
npm start
```

Open your browser and navigate to `http://localhost:3000` to access the live web application platform.

### Building the 6-Page IEEE Research Paper PDF
```bash
npm run build:pdf
```

---

## 📜 Citation & Reference

If you use Lattice-Guard in your research or project, please cite our IEEE conference paper:

```bibtex
@inproceedings{sharma2026latticeguard,
  title={Lattice-Guard: A Sub-Nanosecond Asymmetric Dual-Core Architecture for Multi-Vector Hardware Trojan Isolation with Low Area Overhead},
  author={Sharma, Aarav and Verma, Rohan and Rao, Vikramaditya},
  booktitle={IEEE Transactions / Conference Publication on Hardware Security},
  pages={1--6},
  year={2026}
}
```

---

## 📄 License
This project is released under the [MIT License](LICENSE).
