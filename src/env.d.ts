/// <reference types="vite/client" />

declare const __BUILD_ENV__: string;
declare const __COMMIT__: string;
/** Whether this build carries the buttons on a phone's screen (src/touch/). vite.config.ts decides. */
declare const __TOUCH__: boolean;
/** Whether this build carries accounts (src/account/) and the admin's tracker. vite.config.ts decides. */
declare const __ACCOUNTS__: boolean;
