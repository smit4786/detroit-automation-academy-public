---
title: "Michigan Central Infrastructure: Building Autonomous Learning at Scale"
date: 2026-03-29T09:00:00-05:00
draft: false
tags: ["Infrastructure", "Real-World-Deployment", "Partnership", "Detroit-Innovation"]
categories: ["Infrastructure", "Institutional-Development"]
author: "Chief Operations Officer"
featured_image: "/images/daa-logo.svg"
description: "A behind-the-scenes look at the physical and digital infrastructure built at The Station @ Michigan Central to support large-scale autonomous learning deployment."
---

# 🏛️ Michigan Central Infrastructure: Building Autonomous Learning at Scale

**Classification:** PUBLIC_TECHNICAL_OVERVIEW  
**Location:** The Station @ Michigan Central  
**Published:** March 29, 2026

## Overview

The Detroit Automation Academy's partnership with Michigan Central Station has created a **uniquely designed learning infrastructure** combining:

- 🏢 Historic industrial architecture
- 💻 Cutting-edge cloud computing
- 🤖 Hardware-accelerated autonomous systems labs
- 🌐 Distributed network infrastructure

This facility now serves as the **hub for EPOCH VII autonomous agent deployment** across Detroit.

---

## Physical Infrastructure

### **The Youth STEM Lab**

**Location:** 2001 15th Street, Detroit, MI 48216 (The Station @ Michigan Central)  
**Operational Since:** March 2026  
**Capacity:** 40 students per cohort | 3 cohorts/quarter = 120 students/quarter

#### Lab Sections

**Section 1: Hardware Control Labs** (Weeks 1-3)
```
├── 40 Workstations (Intel i7 + Raspberry Pi 5)
├── GPIO Lab Equipment
│   ├── LED matrices (WS2812B programmable)
│   ├── Button/switch arrays
│   ├── Analog sensors (temp, humidity, light, motion)
│   ├── Servo motors & relay modules
│   └── Real-time oscilloscope monitoring
├── Network Infrastructure
│   ├── Gigabit Ethernet to all nodes
│   ├── MQTT broker (mosquitto, <10ms latency)
│   └── Real-time telemetry pipeline → Google Cloud Pub/Sub
└── Instructor Station
    ├── Central monitoring dashboard
    ├── Remote code deployment capability
    └── Hardware breakout diagnostics
```

**Section 2: Fabrication Labs** (Weeks 4-6)
```
├── CAD Workstations (5x high-performance machines)
│   ├── Parametric design software (SolidPy + Fusion 360)
│   ├── GPU-accelerated rendering
│   └── Real-time collaborative design environment
├── Fabrication Equipment
│   ├── Laser Cutter (40W CO2 Glowforge Pro)
│   │   └── Precision: ±0.3mm, Speed: 500mm/s
│   ├── 3D Printers (3x Prusa i3 MK3S+)
│   │   └── Resolution: 0.2mm, Multi-material capability
│   ├── CNC Router (Shapeoko 5)
│   │   └── Cutting area: 1200 x 750mm
│   └── Materials Library
│       ├── Acrylic sheets (clear, frosted, colored)
│       ├── Plywood (3mm, 6mm, hardwood veneer)
│       ├── PLA filament (biodegradable, multi-color)
│       ├── Metal stock (aluminum, steel for advanced modules)
│       └── Carbon fiber sheets (lightweight structures)
└── Documentation Station
    └── Real-time design-to-fabrication workflow tracking
```

**Section 3: Autonomous Systems Labs** (Weeks 7-10)
```
├── Rover Assembly Area
│   ├── Pre-fabricated chassis kits
│   ├── Motor + servo assembly stations
│   ├── Sensor mounting fixtures
│   └── Telemetry calibration rigs
├── Hardware Stack
│   ├── Main Controller: Raspberry Pi 5 (8GB RAM)
│   ├── Motor Controllers: L298N (2x for drive motors)
│   ├── Servos: MG996R (2x for steering)
│   ├── Sensors
│   │   ├── LiDAR (SICK TiM781S, 25m range)
│   │   ├── IMU (BNO085, 9-axis fusion)
│   │   ├── GPS (NEO-M9N, <2.5m accuracy)
│   │   ├── 12x infrared obstacle sensors
│   │   └── Wheel encoders (quadrature, 200 CPR)
│   ├── Power System
│   │   ├── LiFePO4 battery (5S, 100Wh)
│   │   ├── 5V/3A BEC (servo power)
│   │   ├── USB-C charging dock
│   │   └── Battery management system (active balancing)
│   └── Communication
│       ├── 5GHz WiFi (Ubiquiti AirMax)
│       ├── 433MHz backup telemetry link
│       └── Emergency E-stop on all rovers
├── Testing Arena
│   ├── 400 sq ft controlled environment
│   ├── Obstacle course reconfigurable system
│   ├── Multi-rover coordination space
│   ├── Real-time computer vision tracking (8x cameras)
│   └── Thermal imaging for autonomous behavior analysis
└── Competition Space
    └── Full-scale mission environment (simulating real-world scenarios)
```

**Section 4: Digital Governance & Safety Lab** (Week 11-12)
```
├── Privacy & Encryption Station
│   ├── Cryptographic toolkit (OpenSSL, libsodium)
│   ├── Hardware security module (YubiHSM 2)
│   ├── Blockchain testnet (Ethereum PoA)
│   └── Zero-knowledge proof implementation lab
├── Digital Stoicism Classroom
│   ├── Interactive displays (6x 55" 4K monitors)
│   ├── Social media simulation environment
│   ├── Threat modeling whiteboards
│   └── Ethical decision tree software
└── Capstone Project Station
    └── Professional presentation & defense space
```

---

## Digital Infrastructure

### **Cloud Architecture**

**Primary: Google Cloud Run** (99.99% SLA)
```
Region: us-central1 (Iowa)
├── Frontend Services
│   ├── Landing page (static, CDN-cached)
│   ├── Student enrollment portal
│   ├── Dashboard & analytics
│   └── Status monitoring (public.detroitautomationacademy.com)
├── Backend Services
│   ├── AEAM Singularity API (inference engine)
│   ├── Telemetry aggregation (Pub/Sub → BigQuery)
│   ├── Real-time rover command dispatch
│   └── Student LMS (learning management system)
├── Data Layer
│   ├── Cloud Firestore (student records, encrypted)
│   ├── BigQuery (aggregate telemetry, analytics)
│   ├── Cloud Storage (code repository, artifacts)
│   └── Cloud KMS (encryption key management)
└── Monitoring & Logging
    ├── Cloud Monitoring (real-time alerts)
    ├── Cloud Logging (audit trails, SIF-LAT_V24.0 compliant)
    └── Error Reporting (automatic incident escalation)
```

### **Network Topology**

```
┌─────────────────────────────────────────────────┐
│         Michigan Central Physical Lab            │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │   40 Student Workstations                  │ │
│  │   (Intel i7 + Raspberry Pi 5)              │ │
│  │   Gigabit Ethernet → Ubiquiti PoE Switch   │ │
│  └────────────────────────────────────────────┘ │
│                        ↓                        │
│  ┌────────────────────────────────────────────┐ │
│  │   Local MQTT Broker (< 10ms latency)      │ │
│  │   - Hardware telemetry aggregation         │ │
│  │   - Real-time command dispatch             │ │
│  └────────────────────────────────────────────┘ │
│                        ↓                        │
│  ┌────────────────────────────────────────────┐ │
│  │   Router (Fortinet FortiGate 500E)         │ │
│  │   - DDoS protection                        │ │
│  │   - VPN tunnel to GCP                      │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                        ↓ VPN (encrypted)
┌─────────────────────────────────────────────────┐
│       Google Cloud Run (us-central1)            │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │   Cloud Pub/Sub                            │ │
│  │   (telemetry ingestion, 1M msg/sec)        │ │
│  └────────────────────────────────────────────┘ │
│                        ↓                        │
│  ┌────────────────────────────────────────────┐ │
│  │   Backend Services (auto-scaling)          │ │
│  │   - AEAM Singularity inference             │ │
│  │   - Real-time analytics                    │ │
│  │   - Student data management                │ │
│  └────────────────────────────────────────────┘ │
│                        ↓                        │
│  ┌────────────────────────────────────────────┐ │
│  │   Storage Layer                            │ │
│  │   - Firestore (student records)            │ │
│  │   - BigQuery (telemetry analytics)         │ │
│  │   - Cloud Storage (artifacts)              │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## Operational Metrics

**As of March 31, 2026:**

| Metric | Value |
|:-------|:-----:|
| **Physical Lab Utilization** | 95% (40/40 stations) |
| **Hardware Uptime** | 99.87% |
| **Cloud Infrastructure SLA** | 99.99% |
| **Average Telemetry Latency** | 7.3ms |
| **Student Data Security** | Zero breaches (SIF-LAT_V24.0 compliant) |
| **Fabrication Output** | 120+ rover chassis/quarter |
| **Autonomous Mission Success Rate** | 94.2% |

---

## Scalability & Future Plans

**Q2 2026: Multi-Site Expansion**
- Second lab location at Wayne State University
- Federated cloud infrastructure (multi-region failover)
- 3x capacity expansion (120 → 360 students/quarter)

**Q3 2026: Partnership Integration**
- Lawrence Tech robotics equipment integration
- Detroit Public Schools embedded learning tracks
- Industry partnerships (manufacturing automation clients)

---

## Conclusion

The Michigan Central infrastructure represents a **new model for hands-on technical education at scale**: combining historic space with cutting-edge technology, rigorous technical standards with ethical governance, and local Detroit roots with global cloud infrastructure.

This is how **autonomous learning infrastructure** is built.

---

*To schedule a lab tour or discuss partnership opportunities, email [partners@detroitautomationacademy.com](mailto:partners@detroitautomationacademy.com)*
