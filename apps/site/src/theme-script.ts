export const themeKey = "create-d9-app-theme"

export const themeScript = `(()=>{try{const t=localStorage.getItem("${themeKey}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch{}})()`
