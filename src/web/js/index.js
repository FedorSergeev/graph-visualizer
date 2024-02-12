import appContext from "./appContext.js"

moduleLoader(appContext, './w3v/screen.w3v.html', reader,
    factory => factory.create('app-root').mount(document.body))

