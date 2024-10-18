import React from 'react'
import {
    FormErrorMessage,
    FormControl,
    FormLabel,
    Input,
    Stack,
    S3UploadInput,
} from '@upvestcz/shared-components'
import { getFieldError } from '@upvestcz/common/forms'
import { FormikProps } from 'formik'
import { OpportunityFormikValues } from '../OpportunityForm/utils'

type DeveloperInfoFormik = Pick<OpportunityFormikValues, 'developer_info' | 'text_id'>

const IMAGE_ACCEPT = 'image/png, image/jpg'

export const OpportunityCreateDeveloperInfo = <Values extends DeveloperInfoFormik>({
    formik,
}: {
    formik: FormikProps<Values>
}) => {
    return (
        <Stack>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'developer_info.ico')}>
                <FormLabel>Developer company ICO</FormLabel>
                <Input
                    value={formik.values.developer_info.ico}
                    name="developer_info.ico"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                <FormErrorMessage>{getFieldError(formik, 'developer_info.ico')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'developer_info.name')}>
                <FormLabel>Developer company name</FormLabel>
                <Input
                    value={formik.values.developer_info.name}
                    name="developer_info.name"
                    onChange={formik.handleChange}
                />
                <FormErrorMessage>{getFieldError(formik, 'developer_info.name')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'developer_info.markNo')}>
                <FormLabel>Developer company case number (sp. zn.)</FormLabel>
                <Input
                    value={formik.values.developer_info.markNo}
                    name="developer_info.markNo"
                    onChange={formik.handleChange}
                />
                <FormErrorMessage>
                    {getFieldError(formik, 'developer_info.markNo')}
                </FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'developer_info.registeredBy')}>
                <FormLabel>Developer company registered by</FormLabel>
                <Input
                    value={formik.values.developer_info.registeredBy}
                    name="developer_info.registeredBy"
                    placeholder="Městský soud v Praze"
                    onChange={formik.handleChange}
                />
                <FormErrorMessage>
                    {getFieldError(formik, 'developer_info.registeredBy')}
                </FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'developer_info.address')}>
                <FormLabel>Developer company address</FormLabel>
                <Input
                    value={formik.values.developer_info.address}
                    name="developer_info.address"
                    onChange={formik.handleChange}
                />
                <FormErrorMessage>
                    {getFieldError(formik, 'developer_info.address')}
                </FormErrorMessage>
            </FormControl>
            <FormControl as={Stack} direction="column" spacing={2}>
                <FormLabel>Developer Logo Image (optional)</FormLabel>
                <S3UploadInput
                    accept={IMAGE_ACCEPT}
                    placeholder="Developer Logo Image"
                    variant="input"
                    uploadPermission="public"
                    s3signingUrl="/s3-public/sign"
                    s3path={`img/${formik.values.text_id}/`}
                    value={formik.values.developer_info.logoImage}
                    onChange={({ filePath }) => {
                        formik.setFieldValue(
                            'developer_info.logoImage',
                            filePath
                                ? `https://upvest-public.s3.eu-central-1.amazonaws.com/${filePath}`
                                : filePath,
                        )
                    }}
                />
            </FormControl>
        </Stack>
    )
}
