HOW IT WORKS - Static.app + GitHub (dashboard poori tarah kaam karta hai)

1. GitHub par naya PUBLIC repo banao. Is zip ki saari files us repo me upload karo (public/ aur content/ folder zaroori hain).
2. GitHub > Settings > Developer settings > Fine-grained token > sirf yahi repo > Contents: Read and write.
3. Static.app Files me "how-it-works-site.zip" ki files upload karo (index.html root me ho).
4. Static.app me config.json kholo aur likho: "owner": GitHub username, "repo": repo naam, "email": apna email. Save.
5. Site: howitworks.staticdomains.app   Dashboard: howitworks.staticdomains.app/#/dashboard/login
   (username, repo, token daalo). Publish dabate hi article GitHub me save hota hai aur site wahin se padhti hai (1-5 min cache).
Dashboard me "Sync site" button purane articles ko site ke liye taiyar karta hai (pehli baar ek baar dabao).
Rebuild (code badalne par): node build.mjs  (ya npm install && npm run build agar Vite chahiye)
