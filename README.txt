HOW IT WORKS - React + GitHub Pages + Dashboard (koi database nahi)
====================================================================
KAISE KAAM KARTA HAI
- Site React (Vite) se bani hai. Har page alag hai: / , /blog , /about , /contact , /articles/<naam> , /dashboard/login , /dashboard
- Article ek JSON file hota hai (content/articles/). Dashboard se Publish karte hi file GitHub repo mein save hoti hai
  aur GitHub Actions site ko 1-2 minute mein dobara bana kar update kar deta hai.
- Login: GitHub username + repo + token. Token ke bina koi article add/edit/delete nahi kar sakta.

SETUP (sirf ek baar)
1. Naya GitHub repo banao (public). Is ZIP ki SAARI files upload karo (".github" folder bhi).
2. Repo > Settings > Pages > Source: "GitHub Actions".
3. Actions tab mein "Build and deploy site" green hone do. Site: https://USERNAME.github.io/REPO/
4. Token: GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate
   - Repository access: sirf yahi repo
   - Permissions > Contents: Read and write
5. https://USERNAME.github.io/REPO/dashboard/login par username, repo naam, token daalo.

ARTICLE DAALNA: + New article > title, category, short description, feature image, content (toolbar se heading/link/image),
FAQs, note, Related ON/OFF > Publish. "Save as draft" site par nahi dikhta.

APNA EMAIL: src/lib.js mein SITE.email badlo (contact form isi par jaata hai).

COMPUTER PAR CHALANA (optional): Node 18+ install karo, phir:  npm install  &&  npm run dev
SECURITY: Token password jaisa hai, kisi ko mat do. Repo public ho to article files sabko dikhti hain.

LOCAL ADMIN + GITHUB AUTO-UPDATE (naya)
1. GitHub par public repo banao, Settings > Pages > Source: "GitHub Actions".
2. Is folder me (Command Prompt):  git init -b main  &&  git add -A  &&  git commit -m first
   git remote add origin https://github.com/USERNAME/REPO.git  &&  git push -u origin main
   (pehli baar push par GitHub login window aayegi)
3. npm install  &&  npm run admin   -> localhost:5173/dashboard
4. Article banao/edit karo, phir "Publish live" -> git push -> 1-2 min me site update.
Tiiny.host ke liye: .env.local me PUBLISH_MODE=tiiny (README ke upar wale steps / .env.local.example dekho).
