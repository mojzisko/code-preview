import React from 'react'
import * as R from 'ramda'
import {
    OPPORTUNITY_PAYMENT_FREQUENCY,
    OPPORTUNITY_INTEREST_RATE_TYPE,
    OPPORTUNITY_MARKET_SEGMENT_LABELS_EN,
    OPPORTUNITY_TYPE_LABELS_EN,
    isKBPortfolioOpportunity,
} from '@upvestcz/common/opportunities-utils'
import {
    FormErrorMessage,
    FormControl,
    FormLabel,
    Flex,
    Select,
    Box,
    Stack,
    Checkbox,
    CheckboxGroup,
    Switch,
    S3UploadInput,
} from '@upvestcz/shared-components'
import { getFieldError } from '@upvestcz/common/forms'
import { FormikProps } from 'formik'
import OpportunityFloatRatesFields from '../OpportunityFloatRatesFields'
import { OpportunityFormikValues } from '../OpportunityForm/utils'

type PropertiesFormik = Pick<
    OpportunityFormikValues,
    | 'reference_rate_id'
    | 'reference_rate_type'
    | 'type'
    | 'payment_frequency'
    | 'in_widget'
    | 'interest_rate_type'
    | 'is_private_placement'
    | 'market_segment'
    | 'currencies'
    | 'report_pdf'
    | 'fees_agreement'
    | 'text_id'
>

type OpportunityFileInputKeys = 'report_pdf' | 'fees_agreement'

type FileInput = {
    label: string
    s3Folder: string
    accept: string
}

const PDF_ACCEPT = 'application/pdf'

const fileInputs: Record<OpportunityFileInputKeys, FileInput> = {
    report_pdf: {
        label: 'Report Pdf',
        s3Folder: 'analysis',
        accept: PDF_ACCEPT,
    },
    fees_agreement: {
        label: 'Fees Agreement',
        s3Folder: 'agreement_sets',
        accept: PDF_ACCEPT,
    },
}

export const OpportunityCreateProperties = <Values extends PropertiesFormik>({
    formik,
}: {
    formik: FormikProps<Values>
}) => {
    return (
        <Stack flex="1" direction="column" spacing={4}>
            <FormControl isInvalid={!!getFieldError(formik, 'type')}>
                <FormLabel>Opportunity type</FormLabel>
                <Select
                    value={formik.values.type as string}
                    onChange={formik.handleChange}
                    name="type"
                >
                    {Object.entries(OPPORTUNITY_TYPE_LABELS_EN).map(([value, label]) => (
                        <option value={value} key={value}>
                            {label}
                        </option>
                    ))}
                </Select>
                <FormErrorMessage>{getFieldError(formik, 'type')}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!getFieldError(formik, 'market_segment')}>
                <FormLabel>Market segment</FormLabel>
                <Select
                    value={formik.values.market_segment as string}
                    onChange={formik.handleChange}
                    name="market_segment"
                >
                    {Object.entries(OPPORTUNITY_MARKET_SEGMENT_LABELS_EN).map(([value, label]) => (
                        <option value={value} key={value}>
                            {label}
                        </option>
                    ))}
                </Select>
                <FormErrorMessage>{getFieldError(formik, 'market_segment')}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!getFieldError(formik, 'payment_frequency')}>
                <FormLabel>Payment frequency</FormLabel>
                <Select
                    value={formik.values.payment_frequency as string}
                    onChange={formik.handleChange}
                    name="payment_frequency"
                >
                    {Object.entries(OPPORTUNITY_PAYMENT_FREQUENCY).map(([label, value]) => (
                        <option value={value} key={label}>
                            {value}
                        </option>
                    ))}
                </Select>
                <FormErrorMessage>{getFieldError(formik, 'payment_frequency')}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!getFieldError(formik, 'interest_rate_type')}>
                <FormLabel>Interest rate type</FormLabel>
                <Select
                    value={formik.values.interest_rate_type as string}
                    onChange={formik.handleChange}
                    name="interest_rate_type"
                >
                    {Object.entries(OPPORTUNITY_INTEREST_RATE_TYPE).map(([label, value]) => (
                        <option value={value} key={label}>
                            {value}
                        </option>
                    ))}
                </Select>
                <FormErrorMessage>{getFieldError(formik, 'interest_rate_type')}</FormErrorMessage>
            </FormControl>

            {!isKBPortfolioOpportunity({ type: formik.values.type }) && (
                <OpportunityFloatRatesFields formik={formik} />
            )}

            <FormControl>
                <Flex justify="center" direction="column">
                    <FormLabel>Is private placement?</FormLabel>
                    <Switch
                        isChecked={formik.values.is_private_placement}
                        name="is_private_placement"
                        onChange={formik.handleChange}
                    />
                </Flex>
            </FormControl>

            <FormControl>
                <Flex justify="center" direction="column">
                    <FormLabel>Add opportunity to opportunity widget (LP)</FormLabel>
                    <Switch
                        isChecked={formik.values.in_widget}
                        name="in_widget"
                        onChange={formik.handleChange}
                    />
                </Flex>
            </FormControl>

            <Box>
                <CheckboxGroup
                    defaultValue={formik.values.currencies}
                    value={formik.values.currencies}
                    onChange={value => {
                        formik.setFieldValue('currencies', value)
                    }}
                >
                    <FormLabel>Currencies</FormLabel>
                    <Stack direction="row">
                        <Checkbox value="CZK">CZK</Checkbox>
                        <Checkbox value="EUR">EUR</Checkbox>
                    </Stack>
                </CheckboxGroup>
            </Box>
            <Stack spacing={4}>
                {R.keys(fileInputs).map(key => (
                    <FormControl key={key} as={Stack} direction="column" spacing={2}>
                        <FormLabel>{fileInputs[key].label} (optional)</FormLabel>
                        <S3UploadInput
                            accept={fileInputs[key].accept}
                            placeholder={fileInputs[key].label}
                            variant="input"
                            uploadPermission="public"
                            s3signingUrl="/s3-public/sign"
                            s3path={`${fileInputs[key].s3Folder}/${formik.values.text_id}/`}
                            value={formik.values[key] ?? ''}
                            onChange={({ filePath }) => {
                                formik.setFieldValue(
                                    key,
                                    filePath
                                        ? `https://upvest-public.s3.eu-central-1.amazonaws.com/${filePath}`
                                        : filePath,
                                )
                            }}
                        />
                    </FormControl>
                ))}
            </Stack>
        </Stack>
    )
}
