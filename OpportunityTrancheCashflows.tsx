import React from 'react'
import { useApolloClient } from '@apollo/client'
import { Button, Flex, Form, Box, BoxProps } from '@upvestcz/shared-components'
import * as yup from 'yup'
import { MergeChakraProps } from '@upvestcz/common/ts-utils'
import { useFormik } from 'formik'
import { OpportunityTranche } from '@upvestcz/common/graphql/typegen'
import { CashflowObjectType } from '@upvestcz/common/opportunities-utils'
import { Currency } from '@upvestcz/common/currency'
import AdminCashflowInput from '../AdminCashflowInput'
import { UpdateOpportunityTrancheCashflow } from '../../graphql/mutation'
import { useToast } from '../../lib/toast'
import logger from '../../lib/logger'
import OpportunityAddInterestRateModal from '../Opportunity/OpportunityAddInterestRateModal'

type FormikValues = {
    interest_rates: Record<string, number>
    cashflow_model: Maybe<Record<string, CashflowObjectType>>
    currencies: Currency[]
}

export const OpportunityTrancheCashflows = ({
    opportunity_tranche,
    opportunity_currencies,
    refetch,
    isOpen,
    onClose,
    ...props
}: MergeChakraProps<
    {
        opportunity_tranche: Pick<OpportunityTranche, 'interest_rates' | 'cashflow_model' | 'id'>
        opportunity_currencies: Currency[]
        refetch: () => void
        isOpen: boolean
        onClose: () => void
    },
    BoxProps
>) => {
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
            cashflow_model: opportunity_tranche?.cashflow_model,
            interest_rates: opportunity_tranche?.interest_rates,
            currencies: opportunity_currencies || [],
        },
        onSubmit: async values => {
            try {
                await client.mutate({
                    mutation: UpdateOpportunityTrancheCashflow,
                    variables: {
                        id: opportunity_tranche.id,
                        data: {
                            cashflow_model: values.cashflow_model,
                            interest_rates: values.interest_rates,
                        },
                    },
                })

                await refetch()
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
