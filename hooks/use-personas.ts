"use client"

import useSWR from "swr"
import { http } from "@/lib/http"
import type { Persona, CreatePersonaRequest, UpdatePersonaRequest } from "@/lib/types"
import { useCallback } from "react"

interface PersonasData {
  builtIn: Persona[]
  custom: Persona[]
}

const fetcher = (url: string) => http.get<PersonasData>(url)

export function usePersonas() {
  const { data, error, mutate } = useSWR<PersonasData>("/api/personas", fetcher)

  const createPersona = useCallback(
    async (request: CreatePersonaRequest) => {
      const result = await http.post<Persona>("/api/personas", request)
      await mutate()
      return result
    },
    [mutate],
  )

  const updatePersona = useCallback(
    async (id: string, request: UpdatePersonaRequest) => {
      const result = await http.put<Persona>(`/api/personas/${id}`, request)
      await mutate()
      return result
    },
    [mutate],
  )

  const deletePersona = useCallback(
    async (id: string) => {
      await http.delete(`/api/personas/${id}`)
      await mutate()
    },
    [mutate],
  )

  return {
    builtIn: data?.builtIn || [],
    custom: data?.custom || [],
    loading: !error && !data,
    error,
    createPersona,
    updatePersona,
    deletePersona,
    refresh: mutate,
  }
}
