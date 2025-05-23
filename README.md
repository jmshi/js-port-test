
# How to play - 1
this is used the Vite Template:
* ```shell
    $ npm run dev
  ```
  * use nvm to switch between versions
    ```shell
     $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
     $ nvm install 18
     $ nvm use 18
     $ nvm list
     $ rm -rf node_modules/ && rm package-lock.json && npm i // try to rebuild
     ```
* open `localhost:5137(or other port #)` to play with arrow keys

![game action shot](images/screen_shot.png)

# How to play - 2
* one could also just download the app.js + index.html files at root directory and
* ```shell
  $ python -m http.server
  ```
  then go to localhost:8000 to play your game.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
