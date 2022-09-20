/* eslint-disable no-console */
import { app } from 'electron'
import { createEinf } from 'einf'
import { KeepLiveTCP } from 'bilibili-live-ws'
import { AppController } from './app.controller'
import { createWindow } from './main.window'

const live = new KeepLiveTCP(92613)

live.on('open', () => console.log('Connection is established'))
// Connection is established
live.on('live', () => {
  live.on('heartbeat', console.log)
  // 74185
})
live.on('msg', data => console.log(data))

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

async function electronAppInit() {
  const isDev = !app.isPackaged
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
      app.exit()
  })

  if (isDev) {
    if (process.platform === 'win32') {
      process.on('message', (data) => {
        if (data === 'graceful-exit')
          app.exit()
      })
    }
    else {
      process.on('SIGTERM', () => {
        app.exit()
      })
    }
  }
}

async function bootstrap() {
  try {
    await electronAppInit()

    await createEinf({
      window: createWindow,
      controllers: [AppController],
      injects: [{
        name: 'IS_DEV',
        inject: !app.isPackaged,
      }],
    })
  }
  catch (error) {
    console.error(error)
    app.quit()
  }
}

bootstrap()
