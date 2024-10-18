import React from 'react'
import {
    FormErrorMessage,
    FormControl,
    FormLabel,
    Stack,
    CurrencyInput,
} from '@upvestcz/shared-components'
import { getFieldError } from '@upvestcz/common/forms'
import { FormikProps } from 'formik'
import DatePicker from '../DatePicker'
import { OpportunityFormikValues } from '../OpportunityForm/utils'

type FundraisingInfoFormik = Pick<
    OpportunityFormikValues,
    | 'distribution_fee'
    | 'maturity'
    | 'expected_maturity'
    | 'max_fundraising_target'
    | 'max_investment'
    | 'min_fundraising_target'
    | 'min_investment'
    | 'fundraising_period_end'
    | 'fundraising_period_start'
    | 'ik_fundraising_period_end'
    | 'net_value'
    | 'loan_interest_rate'
>

export const OpportunityCreateFundraisingInfo = <Values extends FundraisingInfoFormik>({
    formik,
}: {
    formik: FormikProps<Values>
}) => {
    return (
        <Stack>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'loan_interest_rate')}>
                <FormLabel>Developer Interest Rate</FormLabel>
                <CurrencyInput
                    onChange={formik.handleChange}
                    value={formik.values.loan_interest_rate}
                    textAlign="left"
                    name="loan_interest_rate"
                />
                <FormErrorMessage>{getFieldError(formik, 'loan_interest_rate')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'distribution_fee')}>
                <FormLabel>KB distribution Fee</FormLabel>
                <CurrencyInput
                    onChange={formik.handleChange}
                    value={formik.values.distribution_fee}
                    textAlign="left"
                    name="distribution_fee"
                />
                <FormErrorMessage>{getFieldError(formik, 'distribution_fee')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'maturity')}>
                <FormLabel>Current Maturity (inclusive, end of day)</FormLabel>
                <DatePicker
                    endOfDay
                    value={formik.values.maturity}
                    onChange={date => {
                        formik.setFieldValue('maturity', date)
                    }}
                    type="date"
                />
                <FormErrorMessage>{getFieldError(formik, 'maturity')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'expected_maturity')}>
                <FormLabel>Expected (original) Maturity (inclusive, end of day)</FormLabel>
                <DatePicker
                    endOfDay
                    value={formik.values.expected_maturity}
                    onChange={date => {
                        formik.setFieldValue('expected_maturity', date)
                    }}
                    type="date"
                />

                <FormErrorMessage>{getFieldError(formik, 'expected_maturity')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'min_fundraising_target')}>
                <FormLabel>Min. Fundraising Target</FormLabel>
                <CurrencyInput
                    onChange={formik.handleChange}
                    value={formik.values.min_fundraising_target}
                    textAlign="left"
                    name="min_fundraising_target"
                />
                <FormErrorMessage>
                    {getFieldError(formik, 'min_fundraising_target')}
                </FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'max_fundraising_target')}>
                <FormLabel>Max. Fundraising Target</FormLabel>
                <CurrencyInput
                    onChange={formik.handleChange}
                    value={formik.values.max_fundraising_target}
                    textAlign="left"
                    name="max_fundraising_target"
                />
                <FormErrorMessage>
                    {getFieldError(formik, 'max_fundraising_target')}
                </FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'min_investment')}>
                <FormLabel>Min. Investment</FormLabel>
                <CurrencyInput
                    onChange={formik.handleChange}
                    value={formik.values.min_investment}
                    textAlign="left"
                    name="min_investment"
                />
                <FormErrorMessage>{getFieldError(formik, 'min_investment')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'max_investment')}>
                <FormLabel>Max. Investment</FormLabel>
                <CurrencyInput
                    onChange={formik.handleChange}
                    value={formik.values.max_investment}
                    textAlign="left"
                    name="max_investment"
                />
                <FormErrorMessage>{getFieldError(formik, 'max_investment')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'fundraising_period_start')}>
                <FormLabel>Fundraising Period Start (inclusive, start of day)</FormLabel>
                <DatePicker
                    value={formik.values.fundraising_period_start}
                    onChange={date => {
                        formik.setFieldValue('fundraising_period_start', date)
                    }}
                    type="datetime-local"
                />
                <FormErrorMessage>
                    {getFieldError(formik, 'fundraising_period_start')}
                </FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'fundraising_period_end')}>
                <FormLabel>Fundraising Period End (inclusive, end of day)</FormLabel>
                <DatePicker
                    value={formik.values.fundraising_period_end}
                    onChange={date => {
                        formik.setFieldValue('fundraising_period_end', date)
                    }}
                    type="datetime-local"
                />
                <FormErrorMessage>
                    {getFieldError(formik, 'fundraising_period_end')}
                </FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'ik_fundraising_period_end')}>
                <FormLabel>Investment Club Fundraising End (inclusive, end of day)</FormLabel>
                <DatePicker
                    endOfDay
                    value={formik.values.ik_fundraising_period_end}
                    onChange={date => {
                        formik.setFieldValue('ik_fundraising_period_end', date)
                    }}
                    type="date"
                />
                <FormErrorMessage>
                    {getFieldError(formik, 'ik_fundraising_period_end')}
                </FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'net_value')}>
                <FormLabel>Net Value</FormLabel>
                <CurrencyInput
                    onChange={formik.handleChange}
                    value={formik.values.net_value}
                    textAlign="left"
                    name="net_value"
                />
                <FormErrorMessage>{getFieldError(formik, 'net_value')}</FormErrorMessage>
            </FormControl>
        </Stack>
    )
}
