"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
} from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState, useCallback, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Spinner } from "@/components/ui/spinner"
import { useServerMutation } from "@/shared/hooks/use-server-mutation.hook"
import { flatten } from "@/lib/utils"
import { addAgentAction } from "@/application/actions/agent.actions"
import { searchProfilesByEmailAction } from "@/application/actions/profile.actions"
import { agentToggleFormInput, agentToggleSchema } from "@/application/validation/agent.validation"
import { ProfileEntity } from "@/domain/entities/profile.entity"

interface Props {
  realEstateId: string
}

export const AddAgentForm = ({
  realEstateId
}: Props) => {
  const { t } = useTranslation("agents")
  const [searchOptions, setSearchOptions] = useState<{ label: string; value: string }[]>([])
  const pendingQueryRef = useRef<string | null>(null)

  const form = useForm<agentToggleFormInput>({
    resolver: yupResolver(agentToggleSchema),
    defaultValues: {
      real_estate_id: realEstateId,
      profile_id: ''
    },
    mode: "onBlur",
  })

  const { setError, reset, handleSubmit, formState: { isSubmitting } } = form

  const searchMutation = useServerMutation({
    action: searchProfilesByEmailAction,
    onSuccess: (result) => {
      const profiles = "data" in result ? (result.data as ProfileEntity[]) : []
      const options = profiles.map(p => ({
        label: p.email,
        value: p.id,
      }))
      setSearchOptions(options)
      pendingQueryRef.current = null
    },
    onError: (error) => {
      console.error("Search error:", error)
      setSearchOptions([])
      pendingQueryRef.current = null
    },
  })

  const mutation = useServerMutation({
    action: addAgentAction,
    setError,
    onSuccess: () => {
      reset()
    },
    onError: (error) => {
      console.error("Sign in error:", error)
    }
  })

  // Resetear error cuando el usuario empieza a escribir
  useEffect(() => {
    const subscription = form.watch(() => {
      if (mutation.isError) {
        mutation.reset()
      }
    })
    return () => subscription.unsubscribe()
  }, [form, mutation])

  const onSubmit = async (values: agentToggleFormInput) => {
    const formData = new FormData()
    const data = flatten(values, "", formData);
    mutation.action(data)
  }

  const searchUsersByEmail = useCallback(async (email: string): Promise<{ label: string; value: string }[]> => {
    if (!email || email.length < 2) {
      setSearchOptions([])
      return []
    }
    // Store pending query
    pendingQueryRef.current = email
    setSearchOptions([]) // Clear while loading
    
    const formData = new FormData()
    formData.set("email", email)
    searchMutation.action(formData)
    
    // Return empty array - results will be set via useEffect when mutation completes
    return []
  }, [searchMutation])

  const isLoading = isSubmitting || mutation.isPending

  return (
    <Form
      form={form}
      className="py-4 px-2"
      onSubmit={onSubmit}
    >
      <FieldGroup className="gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t('agents:titles.add_agent')}</h1>
          <p className="text-muted-foreground text-balance">
            {t('agents:subtitles.add_agent')}
          </p>
        </div>

        <Form.Autocomplete
          name="profile_id"
          label={t('agents:fields.email')}
          placeholder={t('agents:placeholders.email')}
          onSearch={searchUsersByEmail}
          options={searchOptions}
        />

        <Field>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Spinner data-icon="inline-start" className="mr-2 h-4 w-4" />}
            {t('actions.add-agent')}
          </Button>
        </Field>

      </FieldGroup>
    </Form>
  )
}
