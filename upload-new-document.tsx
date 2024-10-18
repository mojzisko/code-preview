import React from 'react'
import { useFormik } from 'formik'
import * as R from 'ramda'
import * as yup from 'yup'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useApolloClient, gql } from '@apollo/client'
import { handleGraphQLError } from '@upvestcz/common/graphql/utils'
import {
    Form,
    Box,
    Heading,
    Button,
    Stack,
    Flex,
    Text,
    S3UploadInput,
    FormErrorMessage,
    FormControl,
} from '@upvestcz/shared-components'
import { Trans, useTranslation } from 'react-i18next'
import { getFieldError } from '@upvestcz/common/forms'
import { PendingAccountUpdateQueryQuery } from '@upvestcz/common/graphql/typegen'
import { requireAuth, requireFinishedRegistration } from '../../../lib/auth'
import { getAppLayout } from '../../../components/layouts/AppLayout'
import { NextPageWithData, withErrorPage } from '../../../lib/next'
import { useToast } from '../../../lib/toast'
import logger from '../../../lib/logger'

const PENDING_ACCOUNT_UPDATE_QUERY = gql`
    query PendingAccountUpdateQuery {
        pendingAccountUpdate {
            id
            account_id
            id_front
            id_back
        }
    }
`

const UPLOAD_NEW_ID_DOCUMENT = gql`
    mutation uploadNewIdDocument($id_front: String!, $id_back: String!) {
        uploadNewIdDocument(id_front: $id_front, id_back: $id_back) {
            id
        }
    }
`

const uploadInputCommonProps = {
    s3signingUrl: '/s3/sign',
    previewUrlPrefix: '/s3/uploads',
    uploadPermission: 'private',
    accept: 'image/png, image/jpeg, application/pdf',
    variant: 'square',
    withPreview: true,
} as const

type FormikValues = {
    id_front: string
    id_back: string
}

const UploadNewDocument: NextPageWithData<{
    pendingAccountUpdate: PendingAccountUpdateQueryQuery['pendingAccountUpdate']
}> = ({ pendingAccountUpdate }) => {
    const { t } = useTranslation()
    const client = useApolloClient()
    const addToast = useToast()
    const router = useRouter()

    const validationSchema = yup.object().shape({
        id_front: yup.string().required(t('Prosím nahrajte foto přední strany Vašeho dokladu')),
        id_back: yup.string().required(t('Prosím nahrajte foto zadní strany Vašeho dokladu')),
    })

    const formik = useFormik<FormikValues>({
        initialValues: {
            id_front: pendingAccountUpdate?.id_front ?? '',
            id_back: pendingAccountUpdate?.id_back ?? '',
        },
        onSubmit: async (values, { resetForm }) => {
            try {
                await client.mutate({
                    mutation: UPLOAD_NEW_ID_DOCUMENT,
                    variables: {
                        id_front: values.id_front,
                        id_back: values.id_back,
                    },
                })
                addToast({
                    type: 'success',
                    message: t('Doklad totožnosti byl úspěšně nahrán'),
                })
                resetForm()
                router.push('/user/profile')
            } catch (err) {
                logger.error(err)
                addToast({
                    type: 'error',
                    message: t('Při nahrávání dokladu se vyskytla neočekávaná chyba'),
                })
            }
        },
        validationSchema,
    })

    if (!pendingAccountUpdate)
        return (
            <Box maxW="600px" px={4} mx="auto" mt={16} pb={6}>
                {' '}
                <Heading size="lg">
                    {t('Nemáte žádný požadavek na nahrání dového dokladu totožnosti')}
                </Heading>
            </Box>
        )

    return (
        <>
            <Head>
                <title>{t('Nahrání nového dokumentu')}</title>
            </Head>
            <Form onSubmit={formik.handleSubmit}>
                <Stack spacing={6} maxW="600px" px={4} mx="auto" mt={16} pb={6}>
                    <Heading size="lg">
                        {t('Nahrajte prosím nový platný doklad totožnosti')}
                    </Heading>
                    <Text>
                        {t(
                            'Platnost Vašeho primárního dokladu totožnosti skončila. Prosím nahrajte nový platný doklad',
                        )}
                    </Text>
                    <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
                        <FormControl isInvalid={!!getFieldError(formik, 'id_front')}>
                            <S3UploadInput
                                {...uploadInputCommonProps}
                                s3path={`${pendingAccountUpdate?.account_id}/`}
                                placeholder={
                                    <Trans t={t}>
                                        Přední strana
                                        <br />
                                        občanského průkazu
                                    </Trans>
                                }
                                onChange={({ filePath }) => {
                                    formik.setFieldValue('id_front', filePath)
                                }}
                                value={formik.values.id_front}
                                inputProps={{ 'data-test-id': 'input-upload-back' }}
                                removeButtonProps={{ 'data-test-id': 'button-remove-upload-back' }}
                            />
                            <FormErrorMessage mt={2}>
                                {getFieldError(formik, 'id_front')}
                            </FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={!!getFieldError(formik, 'id_back')}>
                            <S3UploadInput
                                {...uploadInputCommonProps}
                                s3path={`${pendingAccountUpdate?.account_id}/`}
                                placeholder={
                                    <Trans t={t}>
                                        Zadní strana
                                        <br />
                                        občanského průkazu
                                    </Trans>
                                }
                                onChange={({ filePath }) => {
                                    formik.setFieldValue('id_back', filePath)
                                }}
                                value={formik.values.id_back}
                                inputProps={{ 'data-test-id': 'input-upload-back' }}
                                removeButtonProps={{ 'data-test-id': 'button-remove-upload-back' }}
                            />
                            <FormErrorMessage mt={2}>
                                {getFieldError(formik, 'id_back')}
                            </FormErrorMessage>
                        </FormControl>
                    </Flex>
                    <Button type="submit">{t('Nahrát dokument')}</Button>
                </Stack>
            </Form>
        </>
    )
}

UploadNewDocument.getInitialProps = async ctx => {
    const { apollo } = ctx

    try {
        const { data } = await apollo.client.query<PendingAccountUpdateQueryQuery>({
            query: PENDING_ACCOUNT_UPDATE_QUERY,
        })

        return apollo.saveCache({
            pendingAccountUpdate: data.pendingAccountUpdate,
        })
    } catch (err) {
        const { mainError } = handleGraphQLError(err)

        logger.error(mainError)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { error: mainError } as any
    }
}

UploadNewDocument.getLayout = (page, props = {}) => getAppLayout(page, { ...props })

export default R.compose(withErrorPage, requireAuth, requireFinishedRegistration)(UploadNewDocument)
