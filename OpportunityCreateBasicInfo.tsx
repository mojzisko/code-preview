import React from 'react'
import { FormErrorMessage, FormControl, FormLabel, Input, Stack } from '@upvestcz/shared-components'
import { getFieldError } from '@upvestcz/common/forms'
import { FormikProps } from 'formik'
import { OpportunityFormikValues } from '../OpportunityForm/utils'

type BasicInfoFormik = Pick<
    OpportunityFormikValues,
    'address' | 'subtitle' | 'subtitle_en' | 'text_id' | 'title' | 'title_en'
>

export const OpportunityCreateBasicInfo = <Values extends BasicInfoFormik>({
    formik,
}: {
    formik: FormikProps<Values>
}) => {
    return (
        <Stack pb={4}>
            <FormControl mb={4}>
                <FormLabel>Text Id</FormLabel>
                <Input
                    value={formik.values?.text_id}
                    name="text_id"
                    onChange={formik.handleChange}
                    /* the text_id input is disabled at this point */
                    isDisabled
                />
                <FormErrorMessage>{getFieldError(formik, 'text_id')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'title')}>
                <FormLabel>Title (cz)</FormLabel>
                <Input value={formik.values.title} name="title" onChange={formik.handleChange} />
                <FormErrorMessage>{getFieldError(formik, 'title')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'title_en')}>
                <FormLabel>Title (en)</FormLabel>
                <Input
                    value={formik.values.title_en}
                    name="title_en"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                <FormErrorMessage>{getFieldError(formik, 'title_en')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'subtitle')}>
                <FormLabel>Subtitle (cz)</FormLabel>
                <Input
                    value={formik.values.subtitle}
                    name="subtitle"
                    onChange={formik.handleChange}
                />
                <FormErrorMessage>{getFieldError(formik, 'subtitle')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'subtitle_en')}>
                <FormLabel>Subtitle (en)</FormLabel>
                <Input
                    value={formik.values.subtitle_en}
                    name="subtitle_en"
                    onChange={formik.handleChange}
                />
                <FormErrorMessage>{getFieldError(formik, 'subtitle_en')}</FormErrorMessage>
            </FormControl>
            <FormControl mb={4} isInvalid={!!getFieldError(formik, 'address')}>
                <FormLabel>Address</FormLabel>
                <Input
                    value={formik.values.address}
                    name="address"
                    onChange={formik.handleChange}
                />
                <FormErrorMessage>{getFieldError(formik, 'address')}</FormErrorMessage>
            </FormControl>
        </Stack>
    )
}
