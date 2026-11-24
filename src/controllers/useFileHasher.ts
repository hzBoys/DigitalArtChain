'use client'

import { useCallback, useState } from 'react'
import { hashMasterFile } from '@/src/utils/hashFile'

export function useFileHasher() {
  const [isHashing, setIsHashing] = useState(false)
  const [hash, setHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hashFile = useCallback(async (file: File): Promise<string | null> => {
    setIsHashing(true)
    setError(null)
    setHash(null)
    try {
      const nextHash = await hashMasterFile(file)
      setHash(nextHash)
      return nextHash
    } catch (hashError) {
      setError(hashError instanceof Error ? hashError.message : 'File gagal diproses.')
      return null
    } finally {
      setIsHashing(false)
    }
  }, [])

  const resetHash = useCallback(() => {
    setHash(null)
    setError(null)
  }, [])

  return { isHashing, hash, error, hashFile, resetHash }
}
