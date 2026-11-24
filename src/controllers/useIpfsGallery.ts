'use client'

import useSWR from 'swr'
import { fetchGalleryProofs } from '@/src/services/contractService'

export function useIpfsGallery() {
  const { data, error, isLoading, mutate } = useSWR('karyachain:public-gallery', fetchGalleryProofs, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 30_000,
  })

  return {
    records: data ?? [],
    error: error instanceof Error ? error.message : null,
    isLoading,
    refresh: () => mutate(),
  }
}
