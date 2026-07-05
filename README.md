# Flow Finance 🌊

Flow Finance is a premium, fully interactive financial planning tool that helps you calculate investments and loans with fluid visual projections. Built with clean, modern styling, dynamic Canvas animations, and high-fidelity charting, it makes complex calculations intuitive and visually engaging.

## 🚀 Live Demo & Deployment

Since Flow Finance is a static client-side web application, you can host it for free on **GitHub Pages** directly from this repository:

1. Push this repository to your GitHub account.
2. Go to the repository settings.
3. In the sidebar, select **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch** and select `main` (or the folder `/ (root)`).
5. Click **Save**. Your site will be live at `https://<your-username>.github.io/<repository-name>/` in a few minutes!

---

## ✨ Features

- **SIP Calculator**: Plan your wealth accumulation with custom monthly investments, estimated annual returns, and time horizons.
- **EMI Calculator**: Estimate monthly repayments, loan durations, and interest ratios for home, car, or personal loans.
- **Loan Cost Planner**: View the complete amortization cost and total interest payable on borrowed amounts.
- **Dynamic Visual Projections**: Real-time breakdown chart showing Principal vs. Estimated Returns/Interest.
- **Interactive Presets**: Quick options (Starter, Steady, Ambitious) to instantly test different planning scenarios.
- **Aesthetic Backdrop**: Custom fluid liquid-scene animation rendered dynamically on HTML5 Canvas and subtle noise overlay for a premium, textured look.
- **Responsive Layout**: Designed for all device sizes, complete with custom slider controls and dark/light theme options.

---

## 🛠️ Technology Stack

- **HTML5**: Structured semantically for accessibility and SEO.
- **CSS3 (Vanilla)**: Fully-custom design system using CSS variables, glassmorphism, responsive grids, and modern layout techniques.
- **JavaScript (ES6+)**: Pure vanilla JS logic for real-time calculations, range slider synchronization, theme toggling, and interactive rendering.
- **Canvas API**: Smooth background waves representing "flow".
- **Icons**: [Lucide Icons](https://lucide.dev/) for crisp, modern icons.

---

## 📂 Project Structure

```text
FlowFinance/
├── .gitignore         # Ignores IDE files and OS metadata
├── index.html         # Main application interface and structure
├── styles.css         # Custom CSS variables, glassmorphism, responsive grid
├── app.js             # Financial calculations, UI handlers, canvas background
├── LICENSE            # MIT open-source license
└── README.md          # Project documentation (this file)
```

---

## 💻 Local Setup & Development

To run Flow Finance locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/FlowFinance.git
   cd FlowFinance
   ```

2. **Run it:**
   - **Method A (Easiest)**: Simply double-click `index.html` or drag it into any modern web browser.
   - **Method B (Using a local server)**: Run a simple static file server:
     ```bash
     npx serve .
     ```
     Or if you have Python installed:
     ```bash
     python -m http.server 8000
     ```
     Then navigate to `http://localhost:8000` (or the port specified by the command).

---
