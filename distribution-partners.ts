import Decimal from 'decimal.js-light'
import { getDisplayName } from '@upvestcz/common/account-utils'
import { LOCALES } from '@upvestcz/common/i18n/locales'
import { formatAmount } from '@upvestcz/common/i18n/formatters'
import { Currency } from '@upvestcz/common/currency'
import prisma from '../prisma'
import { CreatePaymentData } from '../@types/payments'
import { sendEmail } from './mail'
import { EMAIL_TEMPLATE_NAMES } from '../mail_templates'
import logger from '../logger'

interface RelatedAccount {
    payoutAmount: Decimal
    currency: Currency
    email: string
    id: number
    formattedName: string
}

interface DistributionPartnerAccount {
    id: number
    email: string
    relatedAccounts: RelatedAccount[]
}

interface AccountPayout {
    totalPayout: Decimal | undefined
    currency: Currency
}

export const notifyDistributionPartnersAboutClientsPayouts = async (
    payouts: CreatePaymentData[],
    opportunity: { title: string },
) => {
    try {
        const userAccounts = await prisma.accounts.findMany({
            where: {
                id: { in: payouts.map(payout => payout.account_id) },
                distribution_partner_account_id: { not: null },
            },
            select: {
                id: true,
                email: true,
                name: true,
                surname: true,
                is_corporate: true,
                corporate_name: true,
                distribution_partner_accounts: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        })

        const totalPayoutSumByAccountId = payouts.reduce(
            (acc: Map<number, AccountPayout>, payout: CreatePaymentData) => {
                const existingPayout = acc.get(payout.account_id)

                if (existingPayout?.totalPayout) {
                    existingPayout.totalPayout = existingPayout.totalPayout.add(
                        new Decimal(payout.payout),
                    )
                } else {
                    acc.set(payout.account_id, {
                        totalPayout: new Decimal(payout.payout),
                        currency: payout.currency,
                    })
                }
                return acc
            },
            new Map<number, AccountPayout>(),
        )

        const distributionPartnerAccounts = userAccounts
            .flat()
            .reduce((accumulator, userAccount) => {
                const distributionPartner = userAccount.distribution_partner_accounts

                if (distributionPartner) {
                    if (!accumulator.has(distributionPartner.id)) {
                        accumulator.set(distributionPartner.id, {
                            email: distributionPartner.email as string,
                            id: distributionPartner.id,
                            relatedAccounts: [],
                        })
                    }

                    const distributionPartnerAccount = accumulator.get(distributionPartner.id)!

                    const payoutObject = totalPayoutSumByAccountId.get(userAccount.id)!

                    distributionPartnerAccount.relatedAccounts.push({
                        payoutAmount: payoutObject?.totalPayout as Decimal,
                        currency: payoutObject.currency,
                        email: userAccount.email as string,
                        id: userAccount.id,
                        formattedName: getDisplayName(userAccount) as string,
                    })
                }
                return accumulator
            }, new Map<number, DistributionPartnerAccount>())

        await Promise.all(
            Array.from(distributionPartnerAccounts.values())
                .filter(partner => partner.email)
                .map(partner =>
                    sendEmail(
                        'Tito klienti mají právě splacené investice',
                        EMAIL_TEMPLATE_NAMES.clientGotPaidNoticeTemplate,
                        {
                            to: { email: partner.email },
                            emailData: {
                                opportunityTitle: opportunity.title,
                                accountsPayoutData: partner.relatedAccounts.map(account => ({
                                    userEmail: account.email,
                                    payoutAmount: formatAmount(
                                        { value: account.payoutAmount, currency: account.currency },
                                        LOCALES.CS,
                                    ),
                                    userFullName: account.formattedName,
                                })),
                            },
                        },
                    ),
                ),
        )
    } catch (err) {
        logger.error('Sending bapo email notifications failed', err)
    }
}
