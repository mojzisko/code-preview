import React from 'react'
import { useApolloClient } from '@apollo/client'
import { Button, Flex, Form, Box, BoxProps, useDisclosure } from '@upvestcz/shared-components'
import * as yup from 'yup'
import { MergeChakraProps } from '@upvestcz/common/ts-utils'
import { useFormik } from 'formik'
import { Opportunity } from '@upvestcz/common/graphql/typegen'
import { CashflowObjectType } from '@upvestcz/common/opportunities-utils'
import { Currency } from '@upvestcz/common/currency'
import AdminCashflowInput from '../AdminCashflowInput'
import OpportunityAddInterestRateModal from './OpportunityAddInterestRateModal'
import { UpdateCashflowsAndInterestRates } from '../../graphql/mutation'
import { useToast } from '../../lib/toast'
import logger from '../../lib/logger'

type FormikValues = {
    interest_rates: Record<string, number>
    cashflow_model: Maybe<Record<string, CashflowObjectType>>
    currencies: Currency[]
}

export const OpportunityCashflows = ({
    opportunity,
    refetch,
    ...props
}: MergeChakraProps<
    {
        opportunity: Pick<Opportunity, 'interest_rates' | 'cashflow_model' | 'currencies' | 'id'>
        refetch: () => void
    },
    BoxProps
>) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const client = useApolloClient()
    const addToast = useToast()
    const validationSchema = yup.object().shape({
        interest_rates: yup
            .object()
            .test(
                'object-not-empty',
                'Please add some interest rates',
                obj => !!obj && !!Object.keys(obj).length,
            ),
    })
    const formik = useFormik<FormikValues>({
        initialValues: {
            cashflow_model: opportunity?.cashflow_model,
            interest_rates: opportunity?.interest_rates || {},
            currencies: opportunity?.currencies || [],
        },
        onSubmit: async values => {
            try {
                await client.mutate({
                    mutation: UpdateCashflowsAndInterestRates,
                    variables: {
                        id: opportunity.id,
                        data: {
                            cashflow_model: values.cashflow_model ?? undefined,
                            interest_rates: values.interest_rates,
                        },
                    },
                })

                await refetch()
                formik.resetForm()
                addToast({
                    type: 'success',
                    message: 'Interest rates were updated',
                })
            } catch (err) {
                logger.error(err)
                addToast({
                    type: 'error',
                    message: 'An error occured while updating cashflow and interest rates',
                })
            }
        },
        validationSchema,
    })
    return (
        <>
            <Box {...props}>
                <Flex justifyContent="flex-end" mb={2}>
                    <Button variant="outline" size="xs" onClick={onOpen}>
                        Add interest rate
                    </Button>
                </Flex>
                <Box>
                    <Form onSubmit={formik.handleSubmit}>
                        <AdminCashflowInput formik={formik} />
                        {formik.dirty && (
                            <Flex justifyContent="flex-end">
                                <Button mt={4} size="sm" type="submit">
                                    Save
                                </Button>
                            </Flex>
                        )}
                    </Form>
                </Box>
            </Box>
            <OpportunityAddInterestRateModal<FormikValues>
                formik={formik}
                isOpen={isOpen}
                onClose={onClose}
            />
        </>
    )
}
