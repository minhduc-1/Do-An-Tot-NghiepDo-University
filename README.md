# 💸 SmartExpense: Advanced Financial Management & Behavioral Analysis System

**Graduation Project:** A personal finance management application integrating AI-powered receipt recognition (OCR), emotion-based spending tracking, and a multi-layered security architecture.

[![Live Demo](https://img.shields.io/badge/-LIVE_DEMO-black?style=for-the-badge)](#)

---

## 🌟 Core Features

* **🔒 Security & Access Control (RBAC):** Strict authorization system featuring an Admin Dashboard for comprehensive monitoring (Audit Logs). User data is encrypted using the AES standard, combined with a multi-layered login mechanism (2FA, automatic account lockout upon detecting suspicious activities).
* **🧠 Emotional Spending Tracking:** Pioneering the integration of psychological financial analysis. The system issues risk warnings if it detects users spending money while in an unstable emotional state (sadness/stress). Features gamification elements such as the "No-Spend Challenge" to encourage saving habits.
* **📸 Automated Data Entry (AI OCR):** Integrates neural network-based image recognition (`tesseract.js`) allowing for direct scanning of invoices and receipts. The system automatically extracts the largest numbers and pre-fills the transaction form, significantly reducing manual data entry time.
* **🤝 Group Fund Management & Social Rank (Split Bill):** Automated bill-splitting and transparent reconciliation feature for groups. Includes a unique spending credit scoring system, honoring the Top 15% of users with the most efficient financial management habits on the platform.
* **📊 Dashboard Analytics:** Provides a comprehensive overview of Cash Flow (Income/Expense) over the last 7 days via interactive charts. Supports secure data backup and full data extraction to `.csv` and `.json` formats.

## 💻 Tech Stack

* **Frontend & UI/UX:** Developed on **ReactJS 18** and **Vite** for optimized build performance. The interface is designed following modern Fintech standards, featuring an automatic real-time Light/Dark Mode toggle using Vanilla CSS.
* **Data Visualization:** Utilizes **Recharts** to process and render smooth interactive charts (Line, Pie, Bar charts) without causing DOM bottlenecks.
* **Image Processing Engine:** Applies **Tesseract.js** (WebAssembly version) to scan and analyze receipt characters directly in the browser (client-side), completely eliminating the need to send sensitive images to a backend server.
* **Data Encryption:** Integrates **CryptoJS** to encrypt all sensitive user financial data using the AES standard, maximizing protection against data leaks and cyber attacks.
