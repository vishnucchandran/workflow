# How to Publish Your Workflow App

Since this is a static application (HTML, CSS, JS), you can publish it for free using several high-performance services. Here are the best methods:

## Option 1: Netlify Drop (Easiest & Fastest)
*Best for: quick demos or sharing a link in seconds.*

1.  Navigate to [app.netlify.com/drop](https://app.netlify.com/drop).
2.  Open your file explorer to this project's folder:  
    `C:\Users\PC\.gemini\antigravity\scratch\workflow-designer`
3.  Drag and drop the **entire folder** onto the Netlify webpage.
4.  Netlify will upload it and give you a live URL (e.g., `https://random-name.netlify.app`) instantly.

## Option 2: GitHub Pages (Professional Standard)
*Best for: maintaining the code and having a clean version history.*

1.  Create a new repository on [GitHub.com](https://github.com).
2.  Open your terminal in the project folder and run:
    ```bash
    git init
    git add .
    git commit -m "Initial release"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```
3.  Go to your Repository Settings > **Pages**.
4.  Under "Source", select `Deploy from a branch` and choose `main` / `root`.
5.  Save. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`.

## Option 3: Vercel
*Best for: automated deployments and high performance.*

1.  Install the Vercel CLI (if familiar with Node.js) or just go to [vercel.com](https://vercel.com).
2.  Import your GitHub repository from the Vercel dashboard.
3.  It will automatically detect it's a static site and deploy it.

---

## Pre-Flight Checklist
Before publishing, ensure:
- [x] All images/assets are in the correct standard folders (if you add any).
- [x] All links works.
- [x] The `title` tag in `index.html` matches your desires.
