import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: MyCustomAPI
  }
}
interface MyCustomAPI {
  sendPing: (message: string) => void
}
