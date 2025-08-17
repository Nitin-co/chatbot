// src/lib/nhost.ts
import { NhostClient } from '@nhost/nhost-js'

export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN || 'rvmtvbxomszjibeiocvu',
  region: import.meta.env.VITE_NHOST_REGION || 'eu-central-1',
})

