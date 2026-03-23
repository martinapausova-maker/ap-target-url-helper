# Po mém commitu — jen ty (GitHub + Vercel)

Tento soubor doplňuje `ap-web/docs/DEPLOY_VERCEL.md`.

## 1. GitHub — push

V terminálu v kořeni tohoto repa:

```bash
git remote add origin https://github.com/TVUJ-UCET/TVUJ-REPO.git
git push -u origin main
```

*(Pokud je větev `master` místo `main`: `git branch -M main` a pak push.)*

Autentizace: GitHub CLI (`gh auth login`), nebo Personal Access Token, nebo SSH.

## 2. Vercel

1. Import repozitáře z GitHubu  
2. **Root Directory:** `ap-web`  
3. **Environment variables:** `APPS_SCRIPT_PICKS_URL` = stejná hodnota jako v lokálním `ap-web/.env.local`  
4. Deploy  

## 3. Změna autora commitu (volitelné)

Pokud chceš v historii své jméno/e-mail:

```bash
git config user.name "Tvoje Jmeno"
git config user.email "ty@searchtides.com"
# další commity už budou s tímto autorem; starý commit lze upravit: git commit --amend --reset-author
```
