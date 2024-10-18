import React, { useMemo, useState } from 'react'
import {
    OPPORTUNITY_TYPE,
    getOpportunityPrimaryCurrency,
} from '@upvestcz/common/opportunities-utils'
import { REFERENCE_RATE_TYPES } from '@upvestcz/common/rate-types'
import { useFormik } from 'formik'
import * as R from 'ramda'
import * as yup from 'yup'
import {
    Button,
    FormErrorMessage,
    FormControl,
    FormLabel,
    Input,
    ButtonGroup,
    Stack,
    Box,
    SimpleGrid,
    Form,
} from '@upvestcz/shared-components'
import { CURRENCIES } from '@upvestcz/common/currency'
import { getFieldError } from '@upvestcz/common/forms'
import { AdminSection } from '../AdminSection'
import {
    getOpportunityFormInitialValues,
    createOrUpdateOpportuntyValidationSchema,
    OpportunityFormType,
    OpportunityFormikValues,
} from './utils'

import {
    OpportunityCreateBasicInfo,
    OpportunityCreateFundraisingInfo,
    OpportunityCreateDeveloperInfo,
    OpportunityCreateProperties,
} from '../OpportunityCreate'

export const OpportunityForm = ({
    onSubmit: onSubmitProp,
    opportunity,
}: {
    onSubmit: (values: OpportunityFormikValues) => void
    opportunity?: OpportunityFormType
}) => {
    const initialValues = useMemo(() => getOpportunityFormInitialValues(opportunity), [opportunity])

    const formik = useFormik<OpportunityFormikValues>({
        onSubmit: async values => {
            await onSubmitProp(
                R.evolve(
                    {
                        reference_rate_type: value =>
                            values.type === OPPORTUNITY_TYPE.BANK_LOAN_PORTFOLIO
                                ? getOpportunityPrimaryCurrency(values) === CURRENCIES.EUR
                                    ? REFERENCE_RATE_TYPES.EURIBOR_1M
                                    : REFERENCE_RATE_TYPES.PRIBOR_1M
                                : value, // force BANK_LOAN_PORTFOLIO to PRIBOR_1M
                        reference_rate_id: value =>
                            values.type === OPPORTUNITY_TYPE.BANK_LOAN_PORTFOLIO ? null : value, // force BANK_LOAN_PORTFOLIO to null
                    },
                    values,
                ),
            )
        },
        initialValues,
        validationSchema: createOrUpdateOpportuntyValidationSchema,
    })

    const isEdit = !!opportunity // if we already have an opportunity, we assume that this is an edit form
    const [showForm, setShowForm] = useState(isEdit)

    return (
        <Form onSubmit={formik.handleSubmit} autoComplete="off">
            {!showForm && (
                <Box>
                    <Stack spacing={2} alignItems="flex-start">
                        <h2>First, type in the text id</h2>
                        <FormControl mb={4}>
                            <FormLabel>Text Id</FormLabel>
                            <Input
                                name="text_id"
                                value={formik.values.text_id}
                                onChange={formik.handleChange}
                            />
                            <FormErrorMessage>{getFieldError(formik, 'text_id')}</FormErrorMessage>
                        </FormControl>
                        <Button
                            onClick={async () => {
                                // Using `formik.validateField(...)` is broken so we call the validation
                                // schema manually
                                // https://github.com/formium/formik/issues/2366
                                try {
                                    formik.setFieldTouched('text_id')
                                    await createOrUpdateOpportuntyValidationSchema.validateAt(
                                        'text_id',
                                        formik.values,
                                    )

                                    setShowForm(true)
                                } catch (err) {
                                    if (!(err instanceof yup.ValidationError)) {
                                        throw err
                                    }

                                    formik.setFieldError('text_id', err.message)
                                }
                            }}
                        >
                            Get Started
                        </Button>
                    </Stack>
                </Box>
            )}
            {showForm && (
                <>
                    <ButtonGroup mb={4} w="full" justifyContent="flex-end">
                        <Button type="submit">{isEdit ? 'Submit changes' : 'Create'}</Button>
                    </ButtonGroup>

                    <SimpleGrid
                        columns={{ base: 1, lg: 2, '2xl': 4 }}
                        spacing={10}
                        alignItems="start"
                        autoRows="max-content"
                    >
                        <AdminSection title="Basic info">
                            <OpportunityCreateBasicInfo<OpportunityFormikValues> formik={formik} />
                        </AdminSection>
                        <AdminSection title="Fundraising info">
                            <OpportunityCreateFundraisingInfo<OpportunityFormikValues>
                                formik={formik}
                            />
                        </AdminSection>
                        <AdminSection title="Developer Info">
                            <OpportunityCreateDeveloperInfo<OpportunityFormikValues>
                                formik={formik}
                            />
                        </AdminSection>

                        <AdminSection title="Properties">
                            <OpportunityCreateProperties<OpportunityFormikValues> formik={formik} />
                        </AdminSection>
                    </SimpleGrid>
                </>
            )}
        </Form>
    )
}
