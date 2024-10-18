import React, { useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import {
    Alert,
    Button,
    Flex,
    LineLoader,
    Stack,
    AlertTitle,
    AlertDescription,
    Text,
} from '@upvestcz/shared-components'
import { formatDateTime } from '@upvestcz/common/date-utils'
import {
    AdminPendingAccountUpdateQueryQuery,
    AdminPendingAccountUpdateQueryQueryVariables,
    RequestAccountUpdateMutationVariables,
    RequestAccountUpdateMutation,
    ApproveUploadedDocumentMutation,
    ApproveUploadedDocumentMutationVariables,
} from '@upvestcz/common/graphql/typegen'
import { RequestAccountUpdate, ApproveUploadedDocument } from '../../graphql/mutation'
import logger from '../../lib/logger'
import AdminPersonalIdPreview from '../AdminPersonalIdPreview'
import { ADMIN_PENDING_ACCOUNT_UPDATE } from '../../graphql/queries'
import { useAccountDetail } from './AccountDetailContextProvider'
import { useToast } from '../../lib/toast'

export const AccountPendingUpdates = () => {
    const [{ account, refetch }] = useAccountDetail()
    const addToast = useToast()

    const {
        data: accountUpdateData,
        error,
        refetch: refetchAccountRequest,
    } = useQuery<AdminPendingAccountUpdateQueryQuery, AdminPendingAccountUpdateQueryQueryVariables>(
        ADMIN_PENDING_ACCOUNT_UPDATE,
        {
            variables: { account_id: account!.id },
            skip: !account,
        },
    )

    const [requestNewDocumentMutation] = useMutation<
        RequestAccountUpdateMutation,
        RequestAccountUpdateMutationVariables
    >(RequestAccountUpdate, {
        refetchQueries: () => {
            Promise.all([refetch(), refetchAccountRequest()])
            return []
        },
    })

    const [approveUploadedDocumentMutation] = useMutation<
        ApproveUploadedDocumentMutation,
        ApproveUploadedDocumentMutationVariables
    >(ApproveUploadedDocument, {
        refetchQueries: () => {
            Promise.all([refetch(), refetchAccountRequest()])
            return []
        },
    })

    const isLoading = !accountUpdateData && !error

    const requestNewDocument = useCallback(
        async (account_id: number) => {
            try {
                await requestNewDocumentMutation({ variables: { account_id } })

                addToast({ type: 'success', message: 'Request has been sent to user' })
            } catch (error) {
                logger.error(error)
                addToast({ type: 'error', message: 'There was an error while requesting document' })
            }
        },
        [addToast, requestNewDocumentMutation],
    )

    const approveIdDocument = useCallback(
        async (account_id: number) => {
            try {
                await approveUploadedDocumentMutation({
                    variables: { account_id },
                })
                addToast({ type: 'success', message: 'Document was approved' })
            } catch (error) {
                logger.error(error)
                addToast({ type: 'error', message: 'There was an error while approving document' })
            }
        },
        [addToast, approveUploadedDocumentMutation],
    )

    const accountUpdateRequest = accountUpdateData?.adminPendingAccountUpdate
    const hasuploadedDocuments = accountUpdateRequest?.id_front && accountUpdateRequest?.id_back

    if (isLoading) return <LineLoader />
    if (error)
        return (
            <Alert status="error">
                <AlertTitle>Fetching account updates failed</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
        )

    return (
        <Flex direction="column">
            {!accountUpdateRequest ? (
                <Button
                    variant="link"
                    alignSelf="flex-end"
                    onClick={() => requestNewDocument(account!.id)}
                >
                    Request new document
                </Button>
            ) : (
                <>
                    {hasuploadedDocuments ? (
                        <>
                            <Alert status="warning">
                                <Text>These update documents are pending review and approval.</Text>
                            </Alert>
                            <Text fontWeight="bold" mt={6}>
                                New Documents:
                            </Text>
                            <Stack spacing={6}>
                                <AdminPersonalIdPreview
                                    idPath={accountUpdateRequest.id_front}
                                    idName="Frontside"
                                />
                                <AdminPersonalIdPreview
                                    idPath={accountUpdateRequest.id_back}
                                    idName="Backside"
                                />
                                {accountUpdateRequest.id_front && accountUpdateRequest.id_back && (
                                    <Button
                                        alignSelf="flex-end"
                                        onClick={() => approveIdDocument(account!.id)}
                                    >
                                        Approve Document
                                    </Button>
                                )}
                            </Stack>
                            <Text fontWeight="bold" mt={12}>
                                Old Documents:
                            </Text>
                        </>
                    ) : (
                        <Alert status="warning">
                            <Text>
                                This account has a pending ID update request since{' '}
                                {formatDateTime(accountUpdateRequest.created_at)}. The new IDs were
                                not uploaded yet.
                            </Text>
                        </Alert>
                    )}
                </>
            )}
        </Flex>
    )
}
