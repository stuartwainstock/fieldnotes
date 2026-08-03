import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'eff153ps',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  deployment: {
    appId: 'vmz2oeyrm0g2ima5m65yuapz',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
